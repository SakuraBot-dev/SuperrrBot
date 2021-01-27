import { commander } from '../../lib/api';
import { search, getImg } from './pixiv';

commander.reg({
  cmd: /^\.pix search (.*)$/,
  helper: '.pix search <关键词>		Pixiv搜索图片',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, async (m: Array<string>, e: any, reply: Function) => {
	search(m[1]).then(async (result: any) => {
    if(!result){
      return reply('[Pixiv] 没有搜索到任何结果');
    }

    const url: string = result.image_urls.large;
    
    const tags: Array<string> = [];

    Object.keys(result.tags).forEach(i => {
      const e = result.tags[i];
      tags.push(`#${e.name}`);
    });

    reply([
      // `[CQ:image,file=base64://${await getImg(url.replace('i.pximg.net', 'i.pixiv.cat'))}]`,
      `[CQ:image,file=${url.replace('i.pximg.net', 'i.pixiv.cat')}]`,
      result.title,
      `https://pixiv.net/i/${result.id}`,
      tags.join(' ')
    ].join('\n'))
  })
})