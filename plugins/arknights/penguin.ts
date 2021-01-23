import got from 'got';

const request = async (path: string) => {
  try {
    const result = await got(`https://penguin-stats.cn/PenguinStats${path}`);
    
    if(result.statusCode === 200) return JSON.parse(result.body);
    return null;
  }catch(e) {
    return null;
  }
}

export const getStagesByID = async (id: string) => {
  const path = `/api/v2/stages/${id}`;
  const result = await request(path);
  if(result) {
    if(result.code == 404) return null;

    return result;
  }

  return null;
}

export const GetMatrix = async (item: string) => {
  const path = `/api/v2/result/matrix?itemFilter=${item}&server=CN`;
  const result = await request(path);
  if(result) return result.matrix;
  return null;
}