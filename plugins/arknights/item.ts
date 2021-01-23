import { logger } from '../../lib/api';
import util from 'util'
import got from 'got';

interface Items {
  itemId: string,
  name: string,
  description: string,
  rarity: number,
  iconId: string,
  overrideBkg: any,
  stackIconId: string,
  sortId: number,
  usage: string,
  obtainApproach: any,
  classifyType: string,
  itemType: string,
  stageDropList: {
    stageId: string,
    occPer: string
  }[],
  buildingProductList: {
    roomType: string,
    formulaId: number
  }[]
}

export const getData = async (): Promise<Items[] | null> => {
  try {
    logger.debug('1');

    const result = await got('https://cdn.jsdelivr.net/gh/Kengxxiao/ArknightsGameData@latest/zh_CN/gamedata/excel/item_table.json')
    const data = JSON.parse(result.body);
    const items: Items[] = []

    Object.values(data.items).forEach((e: any) => {
      items.push(e);
    });

    logger.debug(String(items.length));

    return items;
  } catch (error) {
    logger.error(util.inspect(error));
    return null;
  }
}

export const getItem = async (name: string): Promise<Items[] | null> => {
  const items = await getData();
  if(items) {
    let item: Items[] = [];
    items.forEach(e => {
      if(e.name.indexOf(name) !== -1) {
        item.push(e)
      }
    });
    return item;
  } else {
    return null;
  }
}