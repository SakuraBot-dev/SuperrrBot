import fs from 'fs'
import path from 'path'
import sha1 from 'sha1'
import RSSParser from 'rss-parser'
import { ctx } from '../../res/core/ctx'

interface RSSItem {
  id: string,
  url: string,
  title: string,
  latestId: string
}

export default (ctx: ctx) => {
  const Parser = new RSSParser()

  const rss = {
    list (group: string): RSSItem[] {
      try {
        return Object.values(JSON.parse(fs.readFileSync(path.join(ctx.path, group)).toString()))
      } catch (error) {
        return []
      }
    },
    save (group: string, data: string) {
      return fs.writeFileSync(path.join(ctx.path, group), data)
    },
    async add (group: string, url: string) {
      try {
        const list = rss.list(group)
        const id = sha1(url).substr(0, 7)
        for (const item of list) {
          if (item.id === id) return false
        }
        const result = await Parser.parseURL(url)
        list.push({
          id: id,
          url: url,
          title: result.title || 'Untitled',
          latestId: ''
        })
        rss.save(group, JSON.stringify(list))
        return `成功订阅: ${result.title || 'Untitled'}`
      } catch (error) {
        return `订阅添加失败: ${error.code || '未知错误'}`
      }
    },
    remove (group: string, id: string) {
      try {
        const list = rss.list(group)

        const tmp = list.filter(e => {
          if (e.id !== id) return true
          return false
        })

        this.save(group, JSON.stringify(tmp))
        return true
      } catch (error) {
        return false
      }
    },
    async update () {
      const list = fs.readdirSync(ctx.path)
      for (const group of list) {
        const items = rss.list(group)
        for (const index in items) {
          const item = items[index]
          const data = (await Parser.parseURL(item.url)).items.shift()
          if (data) {
            const id = data.guid || data.link
            if (item.latestId !== id && id) {
              items[index].latestId = id
              const g = {
                type: group.split('.')[0].split('-')[0],
                chatId: group.split('.')[0].split('-')[1]
              }

              if (g.type === 'telegram') {
                // 推送TG
                const chatId = group.substr(9)
                ctx.telegram.bot.telegram.sendMessage(chatId, [
                  `您订阅的 ${item.title} 更新了`,
                  `标题: ${data.title}`,
                  `链接: ${data.link}`
                ].join('\n'))
              } else {
                // 推送QQ
                ctx.OneBot.sendGroupMessage(Number(g.chatId), [
                  `您订阅的 ${item.title} 更新了`,
                  `标题: ${data.title}`,
                  `链接: ${data.link}`
                ].join('\n'))
              }
            }
          }
        }
        // 保存更新后的数据
        rss.save(group, JSON.stringify(items))
      }
    }
  }

  setInterval(() => {
    rss.update()
  }, 60e3)

  ctx.command(/^\/rss list$/, '/rss list', '查看RSS订阅列表', (m, source, message, reply) => {
    const id = source === 'telegram' ? message.message.chat.id : (message.group_id || null)
    if (!id) return reply('[RSS] ID读取失败')
    const list = rss.list(`${source}-${id}.json`)
    if (list.length > 0) {
      const msg: string[] = []
      list.forEach(e => {
        msg.push(`id: ${e.id}, title: ${e.title}`)
      })
      if (source === 'telegram') return reply(ctx.telegram.encode(msg.join('\n')), { parse_mode: 'MarkdownV2' })
      reply(msg.join('\n'))
    } else {
      reply('[RSS] 您订阅了个寂寞')
    }
  })

  ctx.command(/^\/rss add (.*)$/, '/rss add <url>', '添加RSS订阅', async (m, source, message, reply) => {
    if (source === 'telegram') {
      const msg = message.update ? message.update.message : message
      if (msg.chat.type !== 'private' && msg.chat.type !== 'channel') {
        const status = (await ctx.telegram.bot.telegram.getChatMember(msg.chat.id, msg.from.id)).status
        if (status !== 'administrator' && status !== 'creator') return reply('[RSS] 请求已忽略')
      }
    }

    if (source === 'OneBot') {
      if (!message.group_id) return reply('[RSS] 不支持私聊中使用此功能')
      const role = message.sender.role
      if (role !== 'admin' && role !== 'owner') return reply('[RSS] 请求已忽略')
    }

    const id = source === 'telegram' ? (message.message ? message.message.chat.id : message.chat.id) : (message.group_id || null)
    if (!id) return reply('[RSS] ID读取失败')
    if (!m) return reply('[RSS] 链接呢?')
    const result = await rss.add(`${source}-${id}.json`, m[1])
    if (result) return reply(`[RSS] ${result}`)
    reply('[RSS] 订阅添加失败')
  })

  ctx.command(/^\/rss del (.*)$/, '/rss del <id>', '删除RSS订阅', async (m, source, message, reply) => {
    if (source === 'telegram') {
      const msg = message.update.message
      if (msg.chat.type !== 'private') {
        const status = (await ctx.telegram.bot.telegram.getChatMember(msg.chat.id, msg.from.id)).status
        if (status !== 'administrator' && status !== 'creator') return reply('[RSS] 请求已忽略')
      }
    }

    if (source === 'OneBot') {
      if (!message.group_id) return reply('[RSS] 不支持私聊中使用此功能')
      const role = message.sender.role
      if (role !== 'admin' && role !== 'owner') return reply('[RSS] 请求已忽略')
    }

    const id = source === 'telegram' ? message.message.chat.id : (message.group_id || null)
    if (!id) return reply('[RSS] ID读取失败')
    if (!m) return reply('[RSS] id呢?')
    const result = await rss.remove(`${source}-${id}.json`, m[1])
    if (result) return reply('[RSS] 订阅删除成功')
    reply('[RSS] 订阅删除失败')
  })

  ctx.command(/^\/rss update$/, '/rss update', '手动刷新RSS订阅', async (m, source, message, reply) => {
    reply('[RSS] 正在更新订阅...')
    await rss.update()
    reply('[RSS] 订阅更新成功')
  })
}
