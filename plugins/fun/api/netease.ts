import got from 'got';
import utils from './utils';

const req = {
  get: async (path: string, args: { [index: string]: string }) => {
    const arg: string[] = [];

    Object.keys(args).forEach(e => {
      arg.push(`${e}=${args[e]}`);
    });

    return await got(`https://163api.imoe.xyz${path}?${arg.join('&')}`);
  }
}

export default {
  comment: {
    hotall: async () => {
      const r = await req.get('/comment/hotwall/list', {});
      const e = JSON.parse(r.body);

      if(e.code === 200){
        return e.data[utils.random(0, 30)];
      }else{
        return null;
      }
    }
  }
}