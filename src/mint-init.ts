#!/usr/bin/env node
import { Command, Option } from 'commander';
import pkgInfo from 'pkginfo';
import os from 'os';
import { init } from './init';
import { netplanStatic } from './netplan-static';

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
  .option('-l, --list-nics', 'List network interfaces', () => {
    const nics = os.networkInterfaces();
    delete nics.lo;
    const keys = Object.keys(nics);
    keys.forEach((key) => {
      nics[key]?.forEach((nicInfo) => {
        if (nicInfo.family === 'IPv4') {
          console.dir({ name: key, cidr: nicInfo.cidr, mac: nicInfo.mac });
        }
      });
    });
    process.exit();
  });

command
  .command('init')
  .addOption(
    new Option('-s, --script-name <name>', 'Initialization Script Name')
      .choices(['init-mint-20', 'init-ubuntu-server-20', 'install-kvm'])
      .makeOptionMandatory(true),
  )
  .option('-q, --silent', 'No console output')
  .action(init);

command
  .command('netplan-static')
  .addOption(
    new Option(
      '-n, --nic-name <name of nic>',
      `Name of network interface (use 'mint-init --list-nics')`,
    ).makeOptionMandatory(true),
  )
  .option('-a, --static-ip <static ip address>', 'Static IP Address (x.x.x.x/y)')
  .option('-g, --gateway <default gateway address>', 'Default Gateway Address')
  .option('-s, --name-servers <name servers...>', 'DNS Name server (x.x.x.x, space separated)')
  .option('-y, --yaml-file <yaml file>', 'NetPlan YAML file to edit (absolute path)')
  .action(netplanStatic);

command.parse();
