#!/usr/bin/env node
import async from 'async';
import path from 'path';
import { Command, Option } from 'commander';
import pkgInfo from 'pkginfo';
import jsonFile from 'jsonfile';
import { CommandLineArgs, Effort } from './interfaces';
import { _spawn } from './spawn';

const command = new Command();

// Add 'package.json' properties to module.exports
pkgInfo(module);

process.on('uncaughtException', (err: Error) => {
  const msg = `UncaughtException [HALT]: ${err.message}`;
  console.error(msg);
  console.error(err.stack);
  // No way to recover from uncaughtException, bail out now
  process.exit(1);
});

command
  .version(module.exports.version, '-v, --version', 'Show program version')
  .description(module.exports.description)
  .option('-q, --silent', 'No console output');

command.addOption(
  new Option('-s, --script-name <name>', 'Initialization Script Name')
    .choices(['init-mint-20', 'init-ubuntu-server-20'])
    .makeOptionMandatory(true),
);

command.parse();

const args = <CommandLineArgs>command.opts();

async.waterfall(
  [
    (cb: (err: Error | null, effort: Effort) => void) => {
      const scriptFileName = path.join(__dirname, `../common/scripts/${args.scriptName}.json`);
      jsonFile.readFile(scriptFileName, cb);
    },
    (effort: Effort, cb: (err: Error | null | undefined) => void) => {
      async.eachSeries(
        effort.jobs,
        (job, _cb) => {
          async.series(
            [
              (__cb) => async.eachSeries(job.serialTasks, _spawn, __cb),
              (__cb) => async.each(job.parallelTasks, _spawn, __cb),
            ],
            _cb,
          );
        },
        cb,
      );
    },
  ],
  (err) => (err ? console.error(err.message) : console.log('OK')),
);
