import { bot } from '../../lib/api';
import arg from 'arg';

export const registerCommand = (command: string, args: any, callback: Function) => {
  bot.on('group_message', e => {
    if(e.raw_message.split(' ')[0] === command) {
      const argv = arg(args, {
        argv: e.raw_message.split(' ')
      });
      callback(argv, e.group_id);
    }
  })
}