import { ctx } from '../../res/core/ctx'
import bili from './bili'

export default (ctx: ctx) => {
  ctx.command(/(a|A)(v|V)(\d+)/, 'AV号', '显示视频信息', async (m, source, message, reply) => {
    if (!m) return
    const aid = m[3]
    const data = await bili.video_aid(aid)
    if (!data) return
    if (source === 'OneBot') {
      const t = []
      t.push('[Bilibili]')
      t.push(`[av${data.aid}]`)
      t.push(`[${data.bvid}]`)
      t.push(`https://b23.tv/${data.bvid}`)
      t.push(`[CQ:image,file=${data.pic}]`)
      t.push(`标题: ${data.title}`)
      t.push(`简介: ${data.desc}`)
      t.push(`UP主: ${data.owner.name}(https://space.bilibili.com/${data.owner.mid})`)
      t.push(`投稿时间: ${new Date(data.pubdate * 1e3).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}`)
      t.push(`分区: ${data.tname}`)
      t.push(`获赞数: ${data.stat.like}`)
      t.push(`投币数: ${data.stat.coin}`)
      reply(t.join('\n'))
    } else {
      const t = []
      t.push('[Bilibili]')
      t.push(`[av${data.aid}]`)
      t.push(`[${data.bvid}]`)
      t.push(`https://b23.tv/${data.bvid}`)
      t.push(`标题: ${data.title}`)
      t.push(`简介: ${data.desc}`)
      t.push(`UP主: ${data.owner.name}(https://space.bilibili.com/${data.owner.mid})`)
      t.push(`投稿时间: ${new Date(data.pubdate * 1e3).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}`)
      t.push(`分区: ${data.tname}`)
      t.push(`获赞数: ${data.stat.like}`)
      t.push(`投币数: ${data.stat.coin}`)
      ctx.telegram.bot.telegram.sendPhoto(message.chat.id, data.pic, {
        caption: t.join('\n')
      })
    }
  })

  ctx.command(/BV(\w{10})/, 'BV号', '显示视频信息', async (m, source, message, reply) => {
    if (!m) return
    const bvid = m[1]
    const data = await bili.video_bvid(bvid)
    if (!data) return
    if (source === 'OneBot') {
      const t = []
      t.push('[Bilibili]')
      t.push(`[av${data.aid}]`)
      t.push(`[${data.bvid}]`)
      t.push(`https://b23.tv/${data.bvid}`)
      t.push(`[CQ:image,file=${data.pic}]`)
      t.push(`标题: ${data.title}`)
      t.push(`简介: ${data.desc}`)
      t.push(`UP主: ${data.owner.name}(https://space.bilibili.com/${data.owner.mid})`)
      t.push(`投稿时间: ${new Date(data.pubdate * 1e3).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}`)
      t.push(`分区: ${data.tname}`)
      t.push(`获赞数: ${data.stat.like}`)
      t.push(`投币数: ${data.stat.coin}`)
      reply(t.join('\n'))
    } else {
      const t = []
      t.push('[Bilibili]')
      t.push(`[av${data.aid}]`)
      t.push(`[${data.bvid}]`)
      t.push(`https://b23.tv/${data.bvid}`)
      t.push(`标题: ${data.title}`)
      t.push(`简介: ${data.desc}`)
      t.push(`UP主: ${data.owner.name}(https://space.bilibili.com/${data.owner.mid})`)
      t.push(`投稿时间: ${new Date(data.pubdate * 1e3).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}`)
      t.push(`分区: ${data.tname}`)
      t.push(`获赞数: ${data.stat.like}`)
      t.push(`投币数: ${data.stat.coin}`)
      ctx.telegram.bot.telegram.sendPhoto(message.chat.id, data.pic, {
        caption: t.join('\n')
      })
    }
  })

  ctx.command(/^B站热搜$/, 'B站热搜', '查看B站热搜', async (m, source, message, reply) => {
    const data = await bili.hotword()

    if (!data) {
      reply('[Bilibili] 查询失败')
    } else {
      const t: string[] = []
      data.forEach(async (e: any, i: number) => {
        t.push(`${i + 1}. ${e.keyword}`)
      })
      reply(t.join('\n'))
    }
  })

  ctx.command(/^今日新番$/, '今日新番', '查看B站今日新番', async (m, source, message, reply) => {
    const data: any = await bili.bangumi.today()
    const mapping: any = {
      1: '一',
      2: '二',
      3: '三',
      4: '四',
      5: '五',
      6: '六',
      7: '日'
    }

    if (data) {
      const week: string = mapping[data.day_of_week] || data.day_of_week
      const msg: string[] = []

      msg.push(`今天是 星期${week}, 将有 ${Object.keys(data.seasons).length} 部新番放送！`)

      Object.values(data.seasons).forEach((e: any) => {
        msg.push(`《${e.title}》将于 ${e.pub_time} 更新 ${e.pub_index}`)
      })

      reply(msg.join('\n'))
    } else {
      reply('[Bilibili] 读取失败')
    }
  })
}
