import { commander, api, app, config, logger } from '../../lib/api'
import fs from 'fs';
import path from 'path';
import rss from 'rss-parser';

interface RssNode {
  id: number,
  url: string,
  title: string,
  last_id: string,
  group: number
}

const dir = path.join(app.data, 'list.json')

const parser: rss = new rss()

const feeder = {
  list: (group: number) => {
    const list: RssNode[] = [];
    let ls: RssNode[] = [];
    
    if(fs.existsSync(dir)) ls = [...JSON.parse(fs.readFileSync(dir).toString())]

    if(group === 0) return ls;
    
    ls.forEach(e => {
      if(e.group === group) list.push(e)
    });

    return list;
  },
  exists: (group: number, url: string): boolean => {
    const list = feeder.list(0);

    list.forEach(e => {
      if(e.group === group && e.url === url) return true;
    })

    return false;
  },
  add: async (group: number, url: string) => {
    const list = feeder.list(0);
    try{
      const result = await parser.parseURL(url);
      const title = result.title === undefined ? url : result.title;
      const id = Math.round((new Date().getTime() - new Date('2020-10-24 00:00:00').getTime())/1e3);

      list.push({
        id: id,
        url: url,
        title: title,
        last_id: '',
        group: group
      });

      fs.writeFileSync(dir, JSON.stringify(list));

      return `订阅成功, 标题: ${title}`;
    }catch(e) {
      return '订阅拉取失败';
    }
  },
  del: (group: number, id: number) => {
    const list = feeder.list(group);
    const l: RssNode[] = [];
    list.forEach(e => {
      if(e.id !== id) l.push(e);
    })

    fs.writeFileSync(dir, JSON.stringify(l));
  },
  update_id: (url: string, id: string | undefined) => {
    const list = feeder.list(0);

    list.forEach((e, i) => {
      if(e.url === url) {
        list[i].last_id = String(id);
      }
    })

    fs.writeFileSync(dir, JSON.stringify(list));
  },
  update: async () => {
    logger.info(`正在更新订阅...`);
    const list: {[index: string]: RssNode[]} = {};
    feeder.list(0).forEach(e => {
      if(!list[e.url]) list[e.url] = [];
      list[e.url].push(e);
    });

    Object.keys(list).forEach(async (url: string) => {
      try {
        logger.debug(`正在更新 ${url} ...`);
        const r = await parser.parseURL(url);
        if(r.items){
          const id = r.items[0].guid === undefined ? r.items[0].link : r.items[0].guid;
          const link = r.items[0].link;
          const title = r.items[0].title;
          const content = r.items[0].content;

          if(list[url][0].last_id !== id){
            // 有更新
            logger.debug(`${url} (${r.title}) 有更新`);
            feeder.update_id(url, id);
            list[url].forEach(async e => {
              const msg: string[] = [];

              msg.push(`您订阅的 ${r.title} 更新了`);
              msg.push(String(title));
              msg.push(`链接: ${r.link}`);

              api.socket.message.sendGroupMessage(e.group, msg.join('\n'))
            })
          }
        }
      }catch(e) {
        logger.warn(`订阅更新失败, url: ${url}`)
      }
    })
    
    logger.info(`订阅更新完成...`);
  }
}

setInterval(feeder.update, config.timer);
feeder.update();

commander.reg({
  cmd: /^\.rss list/,
  helper: '.rss list    查看RSS列表',
  private: false,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, (m: Array<string>, e: any, reply: Function) => {
  const t: string[] = [];
  const list = feeder.list(e.group_id);

  if(list.length === 0){
    reply('[RSS] 您订阅了个寂寞？')
  }else{
    list.forEach(e => {
      t.push(`id: ${e.id}, 标题: ${e.title}`);
    });
    
    reply(t.join('\n'), true);
  }
});

commander.reg({
  cmd: /^\.rss add (.*)/,
  helper: '.rss add <url>   添加订阅',
  private: false,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: true,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  const url = m[1];
  const group = e.group_id;

  if(feeder.exists(group, url)){
    reply('[RSS] 已经订阅过了');
  }else{
    const r = await feeder.add(group, url);
    reply(`[RSS] ${r}`);
  }
});

commander.reg({
  cmd: /^\.rss del (.*)/,
  helper: '.rss del <id>    添加订阅',
  private: false,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: true,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  const id = m[1];
  const group = e.group_id;

  feeder.del(group, Number(id));
  reply('[RSS] 删除成功');
});

commander.reg({
  cmd: /^\.rss update/,
  helper: '.rss update    刷新订阅',
  private: false,
  group: true,
  globalAdmin_require: true,
  groupAdmin_require: true,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  await feeder.update();
  reply('[RSS] 订阅更新成功');
});