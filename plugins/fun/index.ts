import { commander } from '../../lib/api'
import netease from './api/netease';
import utils from './api/utils';
import { searchImage } from './api/img';

commander.reg({
  cmd: /^\.echo (.*)/,
  helper: '.echo <text>		echo',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
	reply(m[1], false);
});

commander.reg({
  cmd: /^\.poke (.*)$/,
  helper: '.poke <QQ>		戳指定的人',
  private: false,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
	reply(`[CQ:poke,qq=${m[1]}]`, false);
});

commander.reg({
  cmd: /^\.poke$/,
  helper: '.poke		戳一下自己',
  private: false,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
	reply(`[CQ:poke,qq=${e.sender.user_id}]`, false);
});

commander.reg({
  cmd: /^\.gift (.*) (.*)$/,
  helper: '.gift <QQ> <礼物id>		送礼物',
  private: false,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
	reply(`[CQ:gift,qq=${m[1]},id=${m[2]}]`, false);
});

commander.reg({
  cmd: /^\.tts (.*)$/,
  helper: '.tts <text>		文本转语音',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
	reply(`[CQ:tts,text=${m[1]}]`, false);
});

commander.reg({
  cmd: /^云村热评$/,
  helper: '云村热评		随机一条网易云热评',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  const comment = await netease.comment.hotall();
  if(!comment){
    reply('什么都没找到啊');
    return;
  }
  reply([
    `『${comment.content}』 ——${comment.simpleUserInfo.nickname}`,
    `来自歌曲：${comment.simpleResourceInfo.name} (${comment.simpleResourceInfo.artists[0].name})[CQ:image,file=base64://${await utils.loadImg(comment.simpleResourceInfo.songCoverUrl)}]`
  ].join('\n'), false);
});

commander.reg({
  cmd: /^搜图(.*)$/,
  helper: '搜图+关键词		搜图啊啊啊啊啊',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
  const result = await searchImage(m[1]);
  if(!result) {
    return reply('没有搜索到任何结果');
  }
  
  reply(`[CQ:image, file=${result.url}]${result.title}`);
});