import { ctx } from '../../res/core/ctx'
import got from 'got'

export default (ctx: ctx) => {
  const blockTags = [
    'R-18',
    'R-18G'
  ]

  const getRandomInt = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

  const parserTag = (tags: any): string[] | false => {
    const result = []

    const items: any = Object.values(tags)
    for (const item of items) {
      const tag = item.translated_name || item.name
      if (blockTags.includes(tag)) return false
      result.push(tag)
    }
    return result
  }

  const pixivSearch = async (word: string) => {
    const illusts = []
    const resp = []
    for (let i = 1; i < 5; i++) {
      resp.push(got.get('https://api.kyomotoi.moe/api/pixiv/search', { searchParams: { word, page: i } }))
    }
    const r = (await Promise.all(resp)).flat().map(e => { return JSON.parse(e.body).illusts }).flat()
    const tmp = Object.values(r).filter((e: any) => {
      if (e.total_bookmarks > 500) return true
      return false
    })
    for (const item of tmp) {
      illusts.push(item)
    }
    return illusts
  }

  ctx.command(/^\/pix (.*)$/, '/pix <keyword>', 'P站搜图', async (m, source, message, reply) => {
    if (m) {
      reply('[Pixiv] Searching...')
      const word: string = m[1].trim()

      if (blockTags.includes(word)) return reply('[Pixiv] 你 想 干 啥?')

      const illusts = await pixivSearch(word)

      if (illusts.length === 0) return reply('[Pixiv] 没有搜索到任何结果')

      const artwork: any = illusts[getRandomInt(0, illusts.length - 1)]
      const tags = parserTag(artwork.tags)
      const url = (artwork.meta_pages.length > 0 ? artwork.meta_pages[0].image_urls.original : artwork.meta_single_page.original_image_url).replace('i.pximg.net', 'pix.3m.chat')

      if (!tags) return reply('[Pixiv] 没有搜索到任何结果')

      if (source === 'OneBot') {
        const m = ctx.OneBot.getBuilder()
        m.image({ url })
        m.warp()
        m.text(artwork.title)
        m.warp()
        m.text(`id: ${artwork.id}`)
        m.warp()
        m.text(tags.map(e => `#${e}`).join(', '))
        reply(m)
      } else {
        try {
          await ctx.telegram.bot.telegram.sendPhoto(message.chat.id, url, {
            caption: [
              artwork.title,
              `id: <a href="https://www.pixiv.net/artworks/${artwork.id}">${artwork.id}</a>`,
              'tags: ',
              tags.map(e => `#${e}`).join('\t')
            ].join('\n'),
            parse_mode: 'HTML'
          })
        } catch (error) {
          ctx.logger.warn(error)
          reply([
            '图片发送失败',
            `原图链接: <a href="https://www.pixiv.net/artworks/${artwork.id}">${artwork.title}</a>`
          ].join('\n'), {
            parser_mod: 'HTML'
          })
        }
      }
    }
  })

  ctx.command(/^\/pix$/, '/pix', '随机一张图', async (m, source, message, reply) => {
    if (source === 'OneBot') {
      reply('链接是 https://api.peer.ink/api/v1/pixiv/wallpaper/image ，图发不出来了，自己去看吧，顺带一提，建议使用Telegram以获得完整体验，Bot用户名: @SummerChan_bot')
    } else {
      try {
        await ctx.telegram.bot.telegram.sendPhoto(message.chat.id, `https://api.peer.ink/api/v1/pixiv/wallpaper/image?_=${new Date().getTime()}`)
      } catch (error) {
        ctx.logger.warn(error)
        reply('图片发送失败')
      }
    }
  })
}
