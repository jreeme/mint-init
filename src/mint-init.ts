#!/usr/bin/env node
import async from 'async';
import { Command } from 'commander';
import pkgInfo from 'pkginfo';
import { CommandLineArgs } from './interfaces';

const command = new Command();

// Add 'package.json' properties to module.exports
pkgInfo(module);

process.on('uncaughtException', (err: Error) => {
  const msg = `UncaughtException [HALT]: ${err.message}`;
  console.error(msg);
  // No way to recover from uncaughtException, bail out now
  process.exit(1);
});
command
  .version(module.exports.version, '-v, --version', 'Show program version')
  .description(module.exports.description)
  .option('-d, --debug', 'output extra debugging')
  .option('-s, --small', 'small pizza size')
  .option('-p, --pizza-type <type>', 'flavor of pizza');

command.parse();

const args = <CommandLineArgs>command.opts();
async.parallel(
  [
    (cb) => {
      if (args.debug) {
        setImmediate(() => {
          console.log(args);
        });
      }
      cb();
    },
    (cb) => {
      setImmediate(() => {
        if (args.small) {
          const msg = '- small pizza size';
          console.log(msg);
          return cb(null, msg);
        }
        return cb();
      });
    },
    (cb) => {
      if (args.pizzaType) {
        const msg = args.pizzaType;
        console.log(msg);
        return cb(null, msg);
      }
      return cb();
    },
  ],
  (err, results) => {
    if (err) {
      console.error(err.message);
    }
    console.dir(results);
    console.log('OK');
  },
);
