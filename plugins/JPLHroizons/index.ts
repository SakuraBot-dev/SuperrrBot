import { ctx } from '../../res/core/ctx'
import { createCanvas } from 'canvas'
import got from 'got'

interface Hroizons {
  targetname: string
  // eslint-disable-next-line camelcase
  datetime_jd: string
  // eslint-disable-next-line camelcase
  datetime_str: string
  x: number
  y: number
  z: string
  vx: string
  vy: string
  vz: string
  lighttime: string
  range: string
  // eslint-disable-next-line camelcase
  range_rate: string
}

interface Point {
  x: number,
  y: number,
  size: number,
  color: string
}

interface Icon {
  color: string,
  text: string
}

export default (ctx: ctx) => {
  const makeImage = (points: Point[], icons: Icon[], length: number) => {
    const c = createCanvas(1000, 1000)
    const ctx = c.getContext('2d')

    ctx.beginPath()
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, 1000, 1000)
    ctx.closePath()

    ctx.beginPath()
    ctx.fillStyle = '#000'
    ctx.moveTo(10, 980)
    ctx.lineTo(10, 990)
    ctx.lineTo(length + 10, 990)
    ctx.lineTo(length + 10, 980)
    ctx.closePath()
    ctx.stroke()

    ctx.font = '18px serif'
    ctx.fillText('1 AU', length + 20, 990)

    for (const point of points) {
      ctx.beginPath()
      ctx.arc(point.x, point.y, point.size, 0, 360, false)
      ctx.fillStyle = point.color
      ctx.fill()
      ctx.closePath()
    }

    let offset = 10

    for (const icon of icons) {
      ctx.fillStyle = icon.color
      ctx.fillRect(4, offset + 2, 16, 14)
      ctx.font = '18px serif'
      ctx.fillText(icon.text, 24, offset + 16)
      offset += 20
    }

    return c.toBuffer()
  }

  const getData = async (target: string, center: string = 'Sun', start: string, stop: string, step: string) => {
    const r = await got.get(`https://api.peer.ink/api/v1/Hroizons?id=${target}&loca=${center}&start=${start}&stop=${stop}&step=${step}`)
    const result: Hroizons[] = []
    const items: string[] = Object.keys(JSON.parse(r.body))

    for (const item of items) {
      const tmp = item.split(',')

      result.push({
        targetname: tmp[0].trim(),
        datetime_jd: tmp[1].trim(),
        datetime_str: tmp[2].trim(),
        x: Number(tmp[3].trim()),
        y: Number(tmp[4].trim()),
        z: tmp[5].trim(),
        vx: tmp[6].trim(),
        vy: tmp[7].trim(),
        vz: tmp[8].trim(),
        lighttime: tmp[9].trim(),
        range: tmp[10].trim(),
        range_rate: tmp[11].trim()
      })
    }

    return result
  }

  ctx.command(/^\/jpl (.*) (.*) (.*) (.*) (.*) (\d+)$/, '/jpl <target> <center> <start> <stop> <step> <zoom>', '绘制星球轨道', async (m, source, message, reply) => {
    if (m) {
      reply('正在下载数据...')
      const target = m[1].split(',')
      const center = m[2]
      const start = m[3]
      const stop = m[4]
      const step = m[5]
      const zoom = Number(m[6])

      if (target.length > 8) return reply('最多只能设置8个目标')

      const points: Point[] = []
      const icons: Icon[] = []

      const p = []

      for (const t of target) {
        p.push(getData(t, center, start, stop, step))
      }

      try {
        const results = await Promise.all(p)
        const colors = ['pink', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange', 'brown', 'grey']

        for (const result of results) {
          const color = colors.shift() || 'black'

          const name = result[0].targetname.replace(/'/g, '').substr(1)

          icons.push({
            color: color,
            text: name
          })

          for (const item of result) {
            points.push({
              x: item.x * zoom + 500,
              y: item.y * zoom + 500,
              color: color,
              size: 1
            })
          }
        }

        points.push({
          x: 500,
          y: 500,
          color: 'red',
          size: 4
        })

        reply('正在绘图...')
        const img = makeImage(points, icons, zoom)
        if (source === 'OneBot') reply(`[CQ:image,file=base64://${Buffer.from(img).toString('base64')}]`)
        if (source === 'telegram') {
          ctx.telegram.bot.telegram.sendPhoto(message.chat.id, {
            source: Buffer.from(img)
          })
        }
      } catch (error) {
        reply('数据下载失败')
      }
    }
  })
}
