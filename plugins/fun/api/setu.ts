import got from 'got';

export const setu = async () => {
  return JSON.parse((await got('https://api.yukari.one/setu/')).body);
}