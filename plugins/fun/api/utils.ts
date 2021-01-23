import got from 'got';

export default {
  loadImg: async (url: string) => {
    return (await got(url)).rawBody.toString('base64');
  },
  random: (n: number, m: number): number => {
    return Math.floor(Math.random()*(m-n+1))+n;
  }
}