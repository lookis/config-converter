
import yaml from 'js-yaml';
import { type NextRequest } from 'next/server';

import { general, us as us_rules } from '@/rules';
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const resp = await fetch('https://api.meomiao.me/api/v1/client/subscribe?token=' + token, {
    headers: {
      "user-agent": "ClashX/1.116.0 (com.west2online.ClashX; build:1.116.0; macOS 13.3.1) Alamofire/5.7.1"
    }
  })

  const config: any = yaml.load(await resp.text())
  config['rules'] = us_rules(config['rules'])
  config['rules'] = general(config['rules'])


  const rules: [string] = config['rules']
  let configs = ""
  const config_prefix = `[General]
bypass-system = true
skip-proxy = 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, localhost, *.local, e.crashlytics.com, captive.apple.com
bypass-tun = 10.0.0.0/8,100.64.0.0/10,127.0.0.0/8,169.254.0.0/16,172.16.0.0/12,192.0.0.0/24,192.0.2.0/24,192.88.99.0/24,192.168.0.0/16,198.18.0.0/15,198.51.100.0/24,203.0.113.0/24,224.0.0.0/4,255.255.255.255/32
dns-server = system, 114.114.114.114, 112.124.47.27, 8.8.8.8, 8.8.4.4
[Rule]
`
  const config_suffix = `FINAL,direct`
  configs += config_prefix
  for (const rule of rules) {
    let [r, t, f] = rule.split(',')
    if (r == 'DOMAIN' || r == 'DOMAIN-KEYWORD' || r == 'DOMAIN-SUFFIX' || r == 'IP-CIDR') {
      if (f.toLowerCase() != 'direct' && f.toLowerCase() != 'reject') {
        f = 'Proxy'
      }
      configs += `${r},${t},${f}\n`
    }
  }
  configs += config_suffix

  return new Response(configs);
}

export const dynamic = 'force-dynamic'