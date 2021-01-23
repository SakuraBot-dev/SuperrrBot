import { commander } from '../../lib/api';
import bili from './bilibili';

commander.reg({
  cmd: /(a|A)(v|V)(\d+)/gm,
  helper: 'av号   查看视频信息',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  const aid = m[3];
  const data = await bili.video_aid(aid);
  if(!data) return;
  const t = [];
  
  t.push(`[Bilibili]`)
  t.push(`[av${data.aid}]`);
  t.push(`[${data.bvid}]`);
  t.push(`https://b23.tv/${data.bvid}`);
  t.push(`[CQ:image,file=${data.pic}]`);
  t.push(`标题: ${data.title}`);
  t.push(`简介: ${data.desc}`);
  t.push(`UP主: ${data.owner.name}(https://space.bilibili.com/${data.owner.mid})`);
  t.push(`投稿时间: ${new Date(data.pubdate*1e3).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}`);
  t.push(`分区: ${data.tname}`);
  t.push(`获赞数: ${data.stat.like}`);
  t.push(`投币数: ${data.stat.coin}`);
  reply(t.join('\n'), false);
})

commander.reg({
  cmd: /BV(\w{10})/gm,
  helper: 'BV号   查看视频信息',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  const bvid = m[1];
  const data = await bili.video_bvid(bvid);
  const t = [];
  
  t.push(`[Bilibili]`)
  t.push(`[av${data.aid}]`);
  t.push(`[${data.bvid}]`);
  t.push(`https://b23.tv/${data.bvid}`);
  t.push(`[CQ:image,file=${data.pic}]`);
  t.push(`标题: ${data.title}`);
  t.push(`简介: ${data.desc}`);
  t.push(`UP主: ${data.owner.name}(https://space.bilibili.com/${data.owner.mid})`);
  t.push(`投稿时间: ${new Date(data.pubdate*1e3).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}`);
  t.push(`分区: ${data.tname}`);
  t.push(`获赞数: ${data.stat.like}`);
  t.push(`投币数: ${data.stat.coin}`);
  reply(t.join('\n'), false);
})

commander.reg({
  cmd: /^(a|A)(u|U)(\d+)$/gm,
  helper: 'au号   查看音频信息',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  const aid = m[3];
  const data = await bili.audio(aid);

  if(!data) return;

  const t = [];
  
  t.push(`[Bilibili]`)
  t.push(`[au${data.id}]`);
  t.push(`https://www.bilibili.com/audio/au${data.id}`)
  t.push(`[CQ:image,file=${data.cover}]`);
  t.push(`标题: ${data.title}`);
  t.push(`简介: ${data.intro}`);
  t.push(`UP主: ${data.uname}(https://space.bilibili.com/${data.uid})`);
  t.push(`投稿时间: ${new Date(data.passtime*1e3).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}`);
  t.push(`收听数: ${data.statistic.play}`);
  t.push(`收藏数: ${data.statistic.collect}`);
  t.push(`投币数: ${data.coin_num}`);

  reply(t.join('\n'), false);
  reply(`[CQ:xml,data=<?xml version="1.0"?><msg serviceID="2" templateID="1" action="web" brief="&#91;分享&#93; ${data.title}" sourceMsgId="0" url="https://www.bilibili.com/audio/au${data.id}" flag="0" adverSign="0" multiMsgFlag="0"><item layout="2"><audio cover="${data.cover}@180w_180h" src="https://api.bilibili.com/audio/music-service-c/shareUrl/redirectHttp?songid=${data.id}"/><title>${data.title}</title><summary>${data.uname}</summary></item></msg>,resid=60]`)
})

commander.reg({
  cmd: /^B站热搜$/gm,
  helper: 'B站热搜   查看B站热搜',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  const data = await bili.hotword();

  if(!data){
    reply(`[Bilibili] 查询失败`);
  }else{
    const t: string[] = [];
    data.forEach(async (e: any, i: number) => {
      const icon = e.icon.length === 0 ? 'http://i0.hdslb.com/bfs/feed-admin/e9e7a2d8497d4063421b685e72680bf1cfb99a0d.png' : e.icon;
      t.push(`[CQ:image,file=${icon}@16w_16h] ${i + 1}. ${e.keyword}`);
    });
    reply(t.join('\n'));
  }
})