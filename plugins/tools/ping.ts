import request from 'request'

const get_auth = (ip: string) => {
  return new Promise(r => {
    request(`http://ping.pe/${ip}`, (err, res, body) => {
      if(!err && res.statusCode === 200) {
        const index = body.indexOf('antiflood=') + 10;
        const cookie = body.substr(index, 32)
        return r(cookie);
      }
      return r(undefined);
    })
  })
}

const get_nodes = (ip: string, auth: string) => {
  return new Promise(r => {
    request({
      uri: `http://ping.pe/${ip}?browsercheck=ok`,
      headers: {
        cookie: `antiflood=${auth}`
      }
    }, (err, res, body) => {
      if(!err && res.statusCode === 200){
        const regex = /doSuperCrazyShit.*\(.*\'(.*)\'.*,.*\'(.*)\'.*,.*\'(.*)\'.*,.*\'(.*)\'.*,.*\'.*\'.*,.*\'(.*)\'.*\)/gm;
        
        let m;
        
        const list = [];
    
        while ((m = regex.exec(body)) !== null) {
          if (m.index === regex.lastIndex) {
              regex.lastIndex++;
          }
          
          const node_id = m[1];
          const location = m[2];
          const isp = m[3];
          const request_id = m[4];
          const sign = m[5];
    
          list.push({
            node_id,
            location,
            isp,
            request_id,
            sign
          })
          
          r(list)
        }
      }else{
        r(null);
        console.log(res.statusCode, body, err);
      }
    })
  })
}

const ping = (node: string, request_id: string, ip: string, sign: string, auth: string): any => {
  return new Promise(r => {
    request({
      uri: `http://ping.pe/pinger.php?action=ping&pinger=${node}&request_id=${request_id}&ip=${ip}&signature=${sign}`,
      timeout: 10e3,
      headers: {
        cookie: `antiflood=${auth}`
      }
    }, (err, res, body) => {
      if(!err && res.statusCode === 200){
        r(body);
      }else{
        r(null);
      }
    })
  })
}

export default (ip: string, cb: Function) => {
  //@ts-ignore
  get_auth(ip).then((auth: string) => {
    //@ts-ignore
    get_nodes(ip, auth).then((list: Array<any>) => {
      if(!list) return;
      const ps: Array<Promise<any>> = [];
      const msg: Array<any> = [];

      list.forEach(e => {
        const p: any[] = [];

        for (let i = 0; i < 5; i++) {
          const i = ping(e.node_id, e.request_id, ip, e.sign, auth);
          p.push(i);
          ps.push(i);
        }

        Promise.all(p).then((d: string[]) => {
          let count = 0;
          d.forEach((e: string) => {
            count += Number(e);
          });

          const n: number = Math.round(count/5 * 1e3)/1e3

          msg.push({
            l: `${e.location} (${e.isp})`,
            d: `: ${!n ? 'timeout' : `${n} ms`}`
          });
        })
      });

      Promise.all(ps).then(e => {
        cb(msg);
      })
    })
  })
}