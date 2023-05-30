
import yaml from 'js-yaml';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const resp = await fetch('https://api.meomiao.me/api/v1/client/subscribe?token=' + token, {
    headers: {
      "user-agent": "ClashX/1.116.0 (com.west2online.ClashX; build:1.116.0; macOS 13.3.1) Alamofire/5.7.1"
    }
  })

  const config: any = yaml.load(await resp.text())
  const us = []
  for (const proxy of config['proxies']) {
    const name = proxy['name'] as string
    if (name.includes('美国')) {
      us.push(name)
    }
  }

  if (us.length > 0) {
    config["proxy-groups"].push({
      "name": "us",
      "type": "url-test",
      "proxies": us,
      "url": "http://www.gstatic.com/generate_204",
      "interval": 86400,
    })
    config['rules'].unshift("DOMAIN-SUFFIX,openai.com,us")
  }
  return new Response(yaml.dump(config));
}

export const dynamic = 'force-dynamic'