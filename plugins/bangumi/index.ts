import {commander} from "../../lib/api";
import * as bangumi from "./bangumi";

commander.reg({
  cmd: /^\.bangumi user (.*)$/,
  helper: '.bangumi user <username>		查看用户统计信息',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  const username: string = m[1];
  const userInfo = await bangumi.user.userInfo(username);
  const userStatus = await bangumi.user.userCollectionsStatus(username);

  const msg: string[] = [];
  
  if(userInfo && userStatus) {
    msg.push(`[CQ:image,file=${userInfo.avatar.large}]`);
    msg.push(`昵称: ${userInfo.nickname}`);
    
    Object.values(userStatus).forEach((e: any) => {
      msg.push(`=======${e.name_cn}=======`);

      Object.values(e.collects).forEach((e: any) => {
        msg.push(`${e.status.name}: ${e.count}`);
      })
    })
  } else {
    msg.push('[Bangumi] 查询失败');
  }

  reply(msg.join('\n'));
});

commander.reg({
  cmd: /^(.*)在看啥$/,
  helper: '<username>在看啥		查看用户收藏信息',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  const username: string = m[1];
  const userInfo = await bangumi.user.userInfo(username);
  const collection = await bangumi.user.userCollection(username, 'watching');

  const msg: string[] = [];

  if(userInfo && collection) {
    msg.push(`=====${userInfo.nickname} 在看的番剧=====`);
    Object.values(collection).forEach(e => {
      msg.push(`${e.subject.name_cn || e.subject.name}: ${e.ep_status}/${e.subject.eps_count || e.subject.eps || 'unknown'}`);
    })
  } else {
    msg.push(`[Bangumi] 查询失败`);
  }

  reply(msg.join('\n'), true);
});