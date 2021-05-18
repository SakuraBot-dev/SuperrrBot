import got from 'got'

const getAuth = async (ip: string) => {
  const resp = await got.get(`http://ping.pe/${ip}`)
  if (resp.statusCode === 200) {
    const index = resp.body.indexOf('antiflood=') + 10
    const cookie = resp.body.substr(index, 32)
    return cookie
  }
}

const getNodes = async (ip: string, auth: string) => {
  const resp = await got.get(`http://ping.pe/${ip}?browsercheck=ok`, {
    headers: {
      cookie: `antiflood=${auth}`
    }
  })

  if (resp.statusCode === 200) {
    // eslint-disable-next-line no-useless-escape
    const regex = /doSuperCrazyShit.*\(.*\'(.*)\'.*,.*\'(.*)\'.*,.*\'(.*)\'.*,.*\'(.*)\'.*,.*\'.*\'.*,.*\'(.*)\'.*\)/gm

    let m

    const list = []

    while ((m = regex.exec(resp.body)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++
      }

      const nodeId = m[1]
      const location = m[2]
      const isp = m[3]
      const requestId = m[4]
      const sign = m[5]

      list.push({
        node_id: nodeId,
        location,
        isp,
        request_id: requestId,
        sign
      })
    }

    return list
  } else {
    return null
  }
}

const ping = async (node: string, requestId: string, ip: string, sign: string, auth: string): Promise<any> => {
  const resp = await got.get(`http://ping.pe/pinger.php?action=ping&pinger=${node}&request_id=${requestId}&ip=${ip}&signature=${sign}`, {
    headers: {
      cookie: `antiflood=${auth}`
    }
  })
  if (resp.statusCode === 200) {
    return resp.body
  }
}

export default (ip: string, cb: Function) => {
  // @ts-ignore
  getAuth(ip).then((auth: string) => {
    // @ts-ignore
    getNodes(ip, auth).then((list: Array<any>) => {
      if (!list) return
      const ps: Array<Promise<any>> = []
      const msg: Array<any> = []

      list.forEach(async e => {
        const p: any[] = []

        for (let i = 0; i < 5; i++) {
          const i = ping(e.node_id, e.request_id, ip, e.sign, auth)
          p.push(i)
          ps.push(i)
        }

        Promise.all(p).then((d: string[]) => {
          let count = 0
          d.forEach((e: string) => {
            count += Number(e)
          })

          const n: number = Math.round(count / 5 * 1e3) / 1e3

          msg.push(`${e.location} (${e.isp}) -> ${!n ? 'timeout' : `${n} ms`}`)
        })
      })

      Promise.all(ps).then(e => {
        cb(msg)
      })
    })
  })
}
