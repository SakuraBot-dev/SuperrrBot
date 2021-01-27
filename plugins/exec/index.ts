import { commander } from "../../lib/api";
import util from 'util';
import { exec } from 'child_process';

commander.reg({
  cmd: /^\.exec (.*)$/,
  helper: '.exec <command>		执行命令',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: true
}, async (m: Array<string>, e: any, reply: Function) => {
  exec(m[1], (err, stdout, stderr) => {
    reply([
      util.inspect(err),
      '===================',
      stdout,
      '===================',
      stderr
    ].join('\n'));
  })
});

commander.reg({
  cmd: /^\.eval (.*)$/,
  helper: '.eval <command>		执行代码',
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: true
}, async (m: Array<string>, e: any, reply: Function) => {
  try {
    reply(util.inspect(eval(m[1])));
  } catch (error) {
    reply(util.inspect(error));
  }
});