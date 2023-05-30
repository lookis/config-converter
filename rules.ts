export function us(rules: [string]): [string] {
  rules.unshift("DOMAIN-SUFFIX,openai.com,us")
  return rules;
}

export function general(rules: [string]): [string] {
  rules.unshift("DOMAIN-SUFFIX,pixiv.cat,萌喵加速-Nirvana")
  return rules;
}