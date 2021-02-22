import ipRegex from 'ip-regex';
import cidrRegex from 'cidr-regex';
import { NetplanStaticCommandLineArgs } from './interfaces';
import { writeNetPlan } from './write-netplan';

function reportError(error: { arg: string; ip: string }): void {
  console.error(`Error: ${error.arg} must be provided (example: --${error.arg} ${error.ip})`);
}

function checkErrors(errors: { arg: string; ip: string }[]): boolean {
  if (!errors.length) {
    return false;
  }
  console.log('\n');
  errors.forEach((error) => {
    reportError(error);
  });
  console.log('\n');
  return true;
}

function checkIps(args: any, ipAddresses: string[]): boolean {
  let bailOut = false;
  ipAddresses.forEach((ipAddress) => {
    if (!(cidrRegex({ exact: true }).test(ipAddress) || ipRegex({ exact: true }).test(ipAddress))) {
      console.error(`'${ipAddress}' is not a valid IP address`);
      bailOut = true;
    }
  });
  if (bailOut) {
    console.dir(args);
  }
  return bailOut;
}

export function netplanStatic(args: NetplanStaticCommandLineArgs): void {
  const errors: { arg: string; ip: string }[] = [];
  if (!args.staticIp) {
    errors.push({ arg: 'static-ip', ip: '192.168.68.105/24' });
  }
  if (!args.gateway) {
    errors.push({ arg: 'gateway', ip: '192.168.68.1' });
  }
  if (!args.nameServers || !args.nameServers.length) {
    errors.push({ arg: 'name-server', ip: '8.8.8.8 8.8.4.4' });
  }
  if (checkErrors(errors)) {
    return;
  }
  const ipAddresses: string[] = [...args.nameServers].concat(args.staticIp, args.gateway);
  if (checkIps(args, ipAddresses)) {
    return;
  }
  if (!cidrRegex({ exact: true }).test(args.staticIp)) {
    console.error(`Error: static-ip must be in CIDR notation (example: 192.168.68.105/24)`);
    console.dir(args);
    return;
  }
  writeNetPlan(args);
}
