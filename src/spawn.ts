import { spawn } from 'child_process';
import chalk from 'chalk';
import EventEmitter from 'events';
import { WriteStream } from 'fs';
import colors from './colors';
import { Task } from './interfaces';

let colorCount = 0;

function streamWrite(writeStream: WriteStream, chunk: string | Uint8Array, color: string) {
  writeStream.write(chalk.keyword(color)(chunk.toLocaleString()));
}

function streamWriteOnData(eventEmitter: EventEmitter, writeStream: WriteStream, color: string) {
  eventEmitter.on('data', (chunk) => streamWrite(writeStream, chunk, color));
}

export function __spawn(task: Task, cb: (err?: Error) => void): void {
  streamWrite(<WriteStream>(<unknown>process.stdout), `# ${task.description}\n`, colors[2]);
  console.log(`Dummy installing: '${task.bashCommandLine}'`);
  cb();
}

export function _spawn(task: Task, cb: (err?: Error) => void): void {
  const { command, args, bashCommandLine } = task;
  const _command = bashCommandLine ? 'bash' : <string>command;
  const _args = bashCommandLine ? ['-c', bashCommandLine] : <string[]>args;
  const color = colors[++colorCount % colors.length];
  streamWrite(<WriteStream>(<unknown>process.stdout), `# ${task.description}\n`, color);
  const childProcess = spawn(_command, _args, { stdio: ['pipe', 'pipe', 'pipe'] });
  childProcess.on('exit', (code): void => (code ? cb(new Error(`spawn exit code: ${code}`)) : cb()));
  streamWriteOnData(<EventEmitter>childProcess.stdout, <WriteStream>(<unknown>process.stdout), color);
  streamWriteOnData(<EventEmitter>childProcess.stderr, <WriteStream>(<unknown>process.stderr), 'red');
}
