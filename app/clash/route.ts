
import rules from '@/rules';
import yaml from 'js-yaml';
import { type NextRequest } from 'next/server';

const config_global = `
mixed-port: 7890
allow-lan: true
bind-address: '*'
mode: rule
log-level: info
external-controller: 127.0.0.1:9090
dns:
  enable: true
  ipv6: false
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  use-hosts: true
  nameserver:
    - https://doh.pub/dns-query
    - https://dns.alidns.com/dns-query
  fallback:
    - https://doh.dns.sb/dns-query
    - https://dns.cloudflare.com/dns-query
    - https://dns.twnic.tw/dns-query
    - tls://8.8.4.4:853
  fallback-filter:
    geoip: true
    ipcidr:
      - 240.0.0.0/4
      - 0.0.0.0/32
`

function generated_proxy(name: string, proxies: string[], type: string = "url-test") {
  const proxy: any = {
    "name": name,
    "type": type,
    "proxies": proxies,
  }
  if (type == "url-test") {
    proxy['url'] = "http://www.gstatic.com/generate_204"
    proxy['interval'] = 3600
  }
  return proxy
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const config: any = yaml.load(config_global)
  const us_proxy_names: string[] = []
  const proxy_names: string[] = []
  const proxies: any[] = []
  const proxy_groups = []
  if (token === process.env.TOKEN) {
    const promises: Promise<any>[] = []
    for (const [proxy_name, url] of Object.entries(process.env)) {
      if (url && proxy_name.toLowerCase().startsWith('clash_')) {
        promises.push(fetch(url, {
          headers: {
            "user-agent": "ClashX/1.116.0 (com.west2online.ClashX; build:1.116.0; macOS 13.3.1) Alamofire/5.7.1"
          }
        }).then((resp) => {
          return resp.text();
        }).then((resp_text) => {
          const proxy_config: any = yaml.load(resp_text)
          // add proxy
          for (const proxy of proxy_config['proxies']) {
            const name = proxy['name'] as string
            proxies.push(proxy)
            // for all proxy group
            proxy_names.push(name)
            // for us proxy group
            if (name.includes('美国')) {
              us_proxy_names.push(name)
            }
          }
          // add this proxy group
          proxy_groups.push(generated_proxy(proxy_name.replace('CLASH_', ''),
            proxy_config['proxies'].map((proxy: any) => {
              return proxy['name']
            })))
        }))
      }
    }
    await Promise.all(promises)
  }

  //global auto proxy
  proxy_groups.unshift(generated_proxy("AUTO", proxy_names))

  //global proxy: auto, each provider
  proxy_groups.unshift(generated_proxy("PROXY", proxy_groups.map((proxy_group: any) => {
    return proxy_group['name']
  }), 'select'))

  //other
  proxy_groups.push(generated_proxy("US", us_proxy_names))

  config["proxy-groups"] = proxy_groups
  config['rules'] = rules()
  config['proxies'] = proxies
  console.log(config)
  return new Response(yaml.dump(config));
}

export const dynamic = 'force-dynamic'