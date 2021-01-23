import cp from 'child_process';
import request from 'request';
import { commander } from '../../lib/api';
import ping from './ping';
import img from './img';

commander.reg({
  cmd: /^\.curl (.*)/,
  helper: '.curl    curl发送请求',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, (m: Array<string>, e: any, reply: Function) => {
  const url = m[1];
  if (url.indexOf('&') != -1 || url.indexOf('|') != -1 || url.indexOf(' ') != -1 || url.indexOf('localhost') != -1 || url.indexOf('127.0.0.1') != -1) {
    reply('[Curl] 你想干啥¿')
    return;
  }

  reply(`[Curl] 正在向 ${m[1]} 发送请求...`);

  const r = cp.exec(`curl -I ${url}`);

  const msg: string[] = [];

  r.stdout?.on('data', e => {
    msg.push(e);
  });

  r.stderr?.on('data', e => {
    msg.push(e);
  });

  r.on('exit', (code, sign) => {
    const t: string[] = [];
    let start = false;
    msg.forEach(e => {
      if (e.indexOf('HTTP') !== -1) start = true;

      if (start) {
        t.push(e);
      }
    })
    reply(t.join('\n'), true);
  })
})

commander.reg({
  cmd: /^\.ping (.*)/,
  helper: '.ping    ping',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, (m: Array<string>, e: any, reply: Function) => {
  const ip = m[1];

  reply(`[Ping] 正在向 ${ip} 发送请求...`);

  ping(ip, async (msg: Array<any>) => {
    let html: string = `<h1>${ip} | GeoPing</h1><hr>`;

    msg.forEach(element => {
      const location = element.l;
      const d = element.d;

      html += `
      <tr>
        <td>${location}</td>
        <td>${d}</td>
      </tr>`
    });

    html = `<table>${html}</table>`;

    reply(`[CQ:image,file=base64://${await img(html, '450px', '1400px')}]`);
  })
})


commander.reg({
  cmd: /^\.mcstats/,
  helper: '.mcstats    查看Mojang服务器状态',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, (m: Array<string>, e: any, reply: Function) => {
  const serverMap: any = {
    'minecraft.net': 'minecraft.net',
    'session.minecraft.net': 'Session',
    'account.mojang.com': 'Account',
    'authserver.mojang.com': 'Auth Server',
    'sessionserver.mojang.com': 'Session Server',
    'api.mojang.com': 'API',
    'textures.minecraft.net': 'Textures',
    'mojang.com': 'mojang.com'
  }

  request('https://api.peer.ink/api/v1/minecraft/mojang/stats', (err, res, body) => {
    if (!err && res.statusCode === 200) {
      const stats = JSON.parse(body);
      if (stats.code === 200) {
        const msg: string[] = [];
        Object.keys(stats.result).forEach((i: string) => {
          const r = stats.result[i];
          msg.push(`${serverMap[i]} : ${r.padStart(6)}`);
        })
        reply(msg.join('\n'));
      } else {
        reply('[MC Stats] 读取失败');
      }
    } else {
      reply('[MC Stats] 读取失败');
    }
  })
})