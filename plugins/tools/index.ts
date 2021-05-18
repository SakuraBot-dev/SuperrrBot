import { ctx } from '../../res/core/ctx'
import { create } from '../pastebin'
import fs from 'fs'
import path from 'path'
import ping from './ping'
import cp from 'child_process'

export default (ctx: ctx) => {
  try {
    fs.mkdirSync(path.join(ctx.path, './log'))
  } catch (error) {}

  const isAllowed = (input: string) => {
    if (input.indexOf('&') !== -1 || input.indexOf(' ') !== -1 || input.indexOf('|') !== -1 || input.indexOf(' ') !== -1 || input.indexOf('localhost') !== -1 || input.indexOf('127.0.0.1') !== -1) return false
    return true
  }

  const Greetings = {
    makeFile: (file: string, type: 'day' | 'night', readfile: boolean = true) => {
      const time = new Date().getTime()
      const data = readfile ? JSON.parse(fs.readFileSync(file).toString()) : {}
      fs.writeFileSync(file, JSON.stringify({
        type: type,
        time: time
      }))
      return data
    },
    timeDiff: (time1: Date, time2: Date) => {
      const t1 = Math.round(time1.getTime() / 1e3)
      const t2 = Math.round(time2.getTime() / 1e3)
      const t = t2 - t1

      const day = {
        t: parseInt(String(t / (60 * 60 * 24))),
        ts: parseInt(String(t / (60 * 60 * 24))) * (60 * 60 * 24)
      }

      const hours = {
        t: parseInt(String((t - day.ts) / (60 * 60))),
        ts: parseInt(String((t - day.ts) / (60 * 60))) * (60 * 60)
      }

      const min = {
        t: parseInt(String((t - hours.ts - day.ts) / 60)),
        ts: parseInt(String((t - hours.ts - day.ts) / 60)) * 60
      }

      const sec = {
        t: t - hours.ts - day.ts - min.ts
      }

      return `${day.t > 0 ? `${day.t}天` : ''} ${hours.t > 0 ? `${hours.t}小时` : ''} ${min.t > 0 ? `${min.t}分钟` : ''}  ${sec.t}秒`.trim()
    }
  }

  ctx.command(/\/ping (.*)/, '/ping <IP>', 'Geo Ping', (m, source, message, reply) => {
    reply('[Ping] Starting...')
    if (m) {
      ping(m[1], async (e: string[]) => {
        ctx.logger.info(`target: ${m[1]}, result: ${e.length}`)
        const t = new Date()
        const time = `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`

        const url = await create([
          'Geo Ping',
          `Target: ${m[1]}`,
          `Time: ${time}`,
          '',
          '',
          ...e
        ].join('\n'), 'SuperBotV3', 'text')
        reply(url)
      })
    }
  })

  ctx.command(/^\/dump$/, '/dump', '查看被回复消息的dump', async (m, source, message, reply) => {
    if (source === 'telegram') {
      if (message.message.reply_to_message) return reply(await create(JSON.stringify(message.message.reply_to_message, undefined, 4), 'SuperBotV3', 'json'))
      reply(await create(JSON.stringify(message.message, undefined, 4), 'SuperBotV3', 'json'))
    }
  })

  ctx.command(/^早安$/, '早安', '对机器人说早安,并记录睡眠/清醒时间', async (m, source, message, reply) => {
    const id = source === 'telegram' ? message.message.from.id : message.sender.user_id
    const userFile = path.join(ctx.path, './log', `${id}.json`)
    if (!fs.existsSync(userFile)) {
      // 文件不存在
      Greetings.makeFile(userFile, 'day', false)
      reply('阁下早上好~')
    } else {
      const data = Greetings.makeFile(userFile, 'day')
      if (data.type === 'day') return reply('阁下早上好~')
      reply(`阁下早安, 您昨晚睡了 ${Greetings.timeDiff(new Date(data.time), new Date())}`)
    }
  })

  ctx.command(/^晚安$/, '晚安', '对机器人说晚安,并记录睡眠/清醒时间', async (m, source, message, reply) => {
    const id = source === 'telegram' ? message.message.from.id : message.sender.user_id
    const userFile = path.join(ctx.path, './log', `${id}.json`)
    if (!fs.existsSync(userFile)) {
      // 文件不存在
      Greetings.makeFile(userFile, 'night', false)
      reply('阁下晚安~')
    } else {
      const data = Greetings.makeFile(userFile, 'night')
      if (data.type === 'night') return reply('阁下晚安~')
      reply(`阁下晚安, 您今天清醒了 ${Greetings.timeDiff(new Date(data.time), new Date())}`)
    }
  })

  ctx.command(/\/dig (.*)/, '/dig <anything>', 'dig', (m, source, message, reply) => {
    reply('[Dig] Starting...')
    if (m) {
      const target = m[1].trim()
      const allow = isAllowed(target)
      if (allow) {
        const r = cp.exec(`dig ${target} any`)

        const msg: string[] = []

        if (!r.stdout || !r.stderr) {
          r.kill('SIGKILL')
          reply('[Dig] failed')
          return
        }

        r.stdout.on('data', e => {
          msg.push(e)
        })

        r.stderr.on('data', e => {
          msg.push(e)
        })

        r.on('exit', async (code, sign) => {
          const m: string[] = []
          msg.forEach(e => {
            m.push(e)
          })

          const t = new Date()
          const time = `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`

          const url = await create([
            'Dig',
            `Target: ${target}`,
            `Time: ${time}`,
            '',
            '',
            ...m
          ].join('\n'), 'SuperBotV3', 'text')
          reply(url)
        })
      }
    }
  })
}
