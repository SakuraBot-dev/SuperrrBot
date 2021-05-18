import { ctx } from '../../res/core/ctx'
// @ts-ignore
import whoiser from 'whoiser'
import { create } from '../pastebin'

export default (ctx: ctx) => {
  const parserObj = (obj: any) => {
    const result: string[] = []
    const keys = Object.keys(obj)
    for (const key of keys) {
      if (typeof obj[key] === 'object') {
        result.push(`${key} ->`)
        const r = parserObj(obj[key])
        for (const item of r) {
          result.push(`\t${item}`)
        }
      } else {
        result.push(`${key} -> ${obj[key]}`)
      }
    }

    return result
  }

  ctx.command(/^\/ip (.*)$/, '/ip <IP Address>', '查询IP信息', async (m, source, message, reply) => {
    if (m) {
      const result = await whoiser.ip(m[1])
      const msg = parserObj(result)
      const url = await create(msg.join('\n'), 'SuperBotV3', 'text')
      reply(url)
    }
  })

  ctx.command(/^\/asn AS(.*)$/, '/asn <asn>', '查询ASN信息', async (m, source, message, reply) => {
    if (m) {
      const result = await whoiser.asn(m[1])
      const msg = parserObj(result)
      const url = await create(msg.join('\n'), 'SuperBotV3', 'text')
      reply(url)
    }
  })

  ctx.command(/^\/domain (.*)$/, '/domain <domain>', '查询域名信息', async (m, source, message, reply) => {
    if (m) {
      const result = await whoiser.domain(m[1])
      const msg = parserObj(result)
      const url = await create(msg.join('\n'), 'SuperBotV3', 'text')
      reply(url)
    }
  })
}
