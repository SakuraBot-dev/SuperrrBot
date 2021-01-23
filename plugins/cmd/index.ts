import { registerCommand } from './cmd'
import { api } from '../../lib/api';

registerCommand('~echo', {
  '--message': String
}, async (argv: any, group_id: number) => {
  await api.http.OneBot.message.sendGroupMsg(group_id, argv['--message'])
})