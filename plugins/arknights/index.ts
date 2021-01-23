import { commander } from '../../lib/api';
import { getItem } from './item';
import { GetMatrix, getStagesByID } from './penguin';

commander.reg({
  cmd: /^查物品(.*)$/,
  helper: '查物品+<关键词>		搜索明日方舟内物品',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  const result = await getItem(m[1]);
  if(result) {
    const msg: string[] = [];
    result.forEach(e => {
      msg.push(`[${e.name}] ${e.usage.replace('\\n', '\n')} \n ${e.description.replace('\\n', '\n')}`);
    })
    reply(msg.join('\n\n=================\n\n'), true);
  } else {
    reply('[Arknights] 未找到')
  }
});

commander.reg({
  cmd: /^查掉落(.*)$/,
  helper: '查掉落+<关键词>		查询明日方舟内物品掉落概率',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  reply('[Arknights] 正在查询...')
  const stats = {
    query: 0,
    startAt: new Date().getTime()/1e3
  };
  const msg: string[] = [];
  const p1: any[] = [];
  const p2: any[] = [];
  // 查询物品id
  const result = await getItem(m[1]);
  stats.query++;
  if(result) {
    for(const index in result) {
      const item = result[index];
      // 查询物品掉落
      stats.query++;
      const tmp = GetMatrix(item.itemId);
      p1.push(tmp);
      tmp.then(matrix => {
        if(matrix) {
          for(const index in matrix) {
            const e = matrix[index];
            const rate = e.quantity/e.times;
            // 查询关卡信息
            stats.query++;
            const tmp = getStagesByID(e.stageId);
            p2.push(tmp);
            tmp.then(stage => {
              if(stage) {
                const cost = Math.round((stage.apCost/rate)*1e2)/1e2;
                msg.push(`[${item.name} - ${stage.code}] 掉落率: ${Math.round(rate*1e4)/1e2}%, 理智消耗: ${stage.apCost}, 平均单件消耗理智: ${cost}`);
              }
            })
          }
        }
      })
    }

    Promise.all(p1).then(e => {
      Promise.all(p2).then(e => {
        msg.push(`[Status] 请求次数: ${stats.query}`);
        msg.push(`[Status] 查询耗时: ${Math.round(((new Date().getTime()/1e3) - stats.startAt)*1e6)/1e6}s`);
        reply(msg.join('\n'));
      })
    })
  } else {
    reply('[Arknights] 未找到\n[Status] 请求次数: 1')
  }
});