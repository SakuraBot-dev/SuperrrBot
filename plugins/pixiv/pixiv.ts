import got from 'got';

const getRandomInt = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n); };

export const search = async (keyword: string) => {
  try {
    const result = await got(`http://api.peer.ink/api/v1/pixiv/search/popular?keyword=${encodeURIComponent(keyword)}`);
    const body = JSON.parse(result.body);

    if (body.code === 200) {
      const imgs = body.result;
      const max = Object.keys(imgs).length;
      
      let id = getRandomInt(0, max);
      let i = 0;
      while(imgs[id].sanity_level >= 4) {
        id = getRandomInt(0, max);

        if(i >= 5){
          id = -1;
          break;
        }
      }

      if(id === -1) return null;
      return imgs[id];
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

export const getImg = (url: string) => {
  return new Promise(r => {
    got(url).then(e => {
      r(Buffer.from(e.body).toString('base64'));
    })
  })
}