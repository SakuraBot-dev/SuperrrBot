import got from 'got';

export default {
  video_aid: async (aid: string) => {
    const r = await got(`http://api.bilibili.com/x/web-interface/view?aid=${aid}`);
    const e = JSON.parse(r.body);
    
    if(e.code === 0){
      return e.data;
    }
    
    return null;
  },
  video_bvid: async (bvid: string) => {
    const r = await got(`http://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
    const e = JSON.parse(r.body);
    
    if(e.code === 0){
      return e.data;
    }
    
    return null;
  },
  audio: async (sid: string) => {
    const r = await got(`https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${sid}`);
    const e = JSON.parse(r.body);

    if(e.code === 0){
      return e.data;
    }
    
    return null;
  },
  hotword: async () => {
    const r = await got(`http://s.search.bilibili.com/main/hotword`);
    const e = JSON.parse(r.body);

    if(e.code === 0){
      return e.list;
    }
    
    return null;
  }
}