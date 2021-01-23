import { logger } from '../../../lib/api';
import util from 'util';
import got from 'got';

const getRandomInt = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n); };

const search = {
  duitang: async (keyword: string) => {
    try {
      const url = `https://www.duitang.com/napi/blog/list/by_search/?include_fields=photo&kw=${encodeURIComponent(keyword)}`;
      const result = JSON.parse((await got(url)).body);
      
      const data = Object.values(result.data.object_list);
      const len = data.length;
      const id = getRandomInt(0, len - 1);
      const e: any = data[id];
      
      return {
        url: e.photo.path,
        title: e.msg,
        source: '堆糖'
      }
    } catch (error) {
      logger.error(`duitang: ${util.inspect(error)}`)
      return;
    }
  },
  huaban: async (keyword: string) => {
    try {
      const url = `https://api.huaban.com/search?q=${encodeURIComponent(keyword)}&per_page=36&page=1&sort=all`;
      const result = JSON.parse((await got(url)).body)
      
      const data = Object.values(result.pins);
      const len = data.length;
      const id = getRandomInt(0, len);
      const e: any = data[id];

      return {
        url: `http://${e.file.bucket}.huabanimg.com/${e.file.key}`,
        title: '',
        source: '花瓣'
      }
    } catch (error) {
      logger.error(`huaban: ${util.inspect(error)}`)
      return;
    }
  }
}

export const searchImage = async (keyword: string) => {
  const searcher = getRandomInt(0, 1) === 1 ? search.duitang : search.huaban;
  return await searcher(keyword);
}