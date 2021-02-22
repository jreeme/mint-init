#!/usr/bin/env node
import { Command, Option } from 'commander';
import pkgInfo from 'pkginfo';
import { init } from './init';
import { netplanStatic } from './netplan-static';
import { listNics } from './list-nics';
import {
  dnsAddForwardZoneFile,
  dnsAddReverseZoneFile,
  dnsAddZone,
  dnsOptions,
  dnsServerInstall,
  dnsServerRestart,
} from './dns';

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
  .option('-l, --list-nics', 'List network interfaces', listNics);

// command.command('dns-server').option('-i, --install', 'Install DNS Server', false).action(dnsServer);
const dnsCommand = command.command('dns');
dnsCommand.command('install').action(dnsServerInstall);
dnsCommand.command('restart').action(dnsServerRestart);
dnsCommand
  .command('options')
  .option('-f, --forwarders <forwarders...>', 'List of upstream DNS servers to use')
  .option('-r, --recursion-nets <recursionNets...>', 'List of allowed recursive search networks')
  .action(dnsOptions);
dnsCommand
  .command('add-zone')
  .addOption(
    new Option('-n, --network-number <x.x.x>', 'Class-C Network number (e.g. 192.168.68)').makeOptionMandatory(true),
  )
  .addOption(new Option('-d, --domain-name <example.com>', 'Domain name (e.g. example.com').makeOptionMandatory(true))
  .action(dnsAddZone);

dnsCommand
  .command('add-forward-zone-file')
  .addOption(
    new Option('-n, --network-number <x.x.x>', 'Class-C Network number (e.g. 192.168.68)').makeOptionMandatory(true),
  )
  .addOption(new Option('-d, --domain-name <example.com>', 'Domain name (e.g. example.com').makeOptionMandatory(true))
  .addOption(
    new Option('-s, --name-server-ip <x.x.x.x>', 'Name server address (e.g. 192.168.68.200').makeOptionMandatory(true),
  )
  .action(dnsAddForwardZoneFile);

dnsCommand
  .command('add-reverse-zone-file')
  .addOption(
    new Option('-n, --network-number <x.x.x>', 'Class-C Network number (e.g. 192.168.68)').makeOptionMandatory(true),
  )
  .addOption(new Option('-d, --domain-name <example.com>', 'Domain name (e.g. example.com').makeOptionMandatory(true))
  .addOption(
    new Option('-s, --name-server-ip <x.x.x.x>', 'Name server address (e.g. 192.168.68.200').makeOptionMandatory(true),
  )
  .action(dnsAddReverseZoneFile);

command
  .command('init')
  .addOption(
    new Option('-s, --script-name <name>', 'Initialization Script Name')
      .choices(['init-mint-20', 'init-ubuntu-server-20', 'install-kvm'])
      .makeOptionMandatory(true),
  )
  .option('-q, --silent', 'No console output', false)
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
