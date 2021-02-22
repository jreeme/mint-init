import fs from 'fs';
import path from 'path';
import lineDriver from 'line-driver';
import zoneFile from 'dns-zonefile';
import { executeNamedEffortScript } from './effort';
import { DnsAddZoneCommandLineArgs, DnsAddZoneFileCommandLineArgs, DnsOptionsCommandLineArgs } from './interfaces';
import { retryAsRoot } from './sudo';

export function dnsOptions(args: DnsOptionsCommandLineArgs): void {
  let lines = '';
  const srcNamedConfOptionsPath = path.join(__dirname, `../common/dns-config/named.conf.options`);
  lineDriver.read({
    in: srcNamedConfOptionsPath,
    line: (props, parser) => {
      lines += `${parser.line}\n`;
      if (parser.line.includes('forwarders {')) {
        if (args.forwarders && args.forwarders.length) {
          args.forwarders.forEach((ip) => {
            lines += `        ${ip};\n`;
          });
        }
      }
      if (parser.line.includes('allow-recursion {')) {
        if (args.recursionNets && args.recursionNets.length) {
          args.recursionNets.forEach((ip) => {
            lines += `        ${ip};\n`;
          });
        }
      }
    },
    close: () => {
      const dstNamedConfOptionsPath = '/etc/bind/named.conf.options';
      fs.writeFile(dstNamedConfOptionsPath, lines, (err) => {
        if (err) {
          if (err.errno === -13) {
            retryAsRoot();
            return;
          }
          console.error(`Error writing '${dstNamedConfOptionsPath}': ${err.message}`);
        }
        console.log('OK');
      });
    },
  });
}

export function dnsAddReverseZoneFile(args: DnsAddZoneFileCommandLineArgs): void {
  const nameServerHostOctet = args.nameServerIp.split('.').reverse()[0];
  let zoneFileText = `;\n`;
  zoneFileText += `; BIND reverse data file for local ${args.networkNumber}.XXX net\n`;
  zoneFileText += `;\n`;
  zoneFileText += `$TTL    604800\n`;
  zoneFileText += `@ IN SOA ${args.domainName}. mail.${args.domainName}. (\n`;
  zoneFileText += `  2                         ; Serial\n`;
  zoneFileText += `  604800                    ; Refresh\n`;
  zoneFileText += `  86400                     ; Retry\n`;
  zoneFileText += `  2419200                   ; Expire\n`;
  zoneFileText += `  604800 )                  ; Negative Cache TTL\n`;
  zoneFileText += `;\n`;
  zoneFileText += `@      IN NS ns.\n`;
  zoneFileText += `${nameServerHostOctet}  IN NS ns.${args.domainName}.\n`;
  const reverseZoneFilePath = `/etc/bind/db.${args.networkNumber}`;
  fs.writeFile(reverseZoneFilePath, zoneFileText, (err) => {
    if (err) {
      if (err.errno === -13) {
        return retryAsRoot();
      }
      return console.error(`Error writing '${reverseZoneFilePath}': ${err.message}`);
    }
    return console.log('OK');
  });
}

export function dnsAddForwardZoneFile(args: DnsAddZoneFileCommandLineArgs): void {
  let zoneFileText = `;\n`;
  zoneFileText += `; BIND data file for local loopback interface\n`;
  zoneFileText += `;\n`;
  zoneFileText += `$TTL    604800\n`;
  zoneFileText += `@ IN SOA ${args.domainName}. mail.${args.domainName}. (\n`;
  zoneFileText += `  2                         ; Serial\n`;
  zoneFileText += `  604800                    ; Refresh\n`;
  zoneFileText += `  86400                     ; Retry\n`;
  zoneFileText += `  2419200                   ; Expire\n`;
  zoneFileText += `  604800 )                  ; Negative Cache TTL\n`;
  zoneFileText += `;\n`;
  zoneFileText += `@      IN NS ns.${args.domainName}.\n`;
  zoneFileText += `@      IN A ${args.nameServerIp}\n`;
  zoneFileText += `@      IN AAAA ::1\n`;
  zoneFileText += `ns     IN A ${args.nameServerIp}\n`;
  const forwardZoneFilePath = `/etc/bind/db.${args.domainName}`;
  fs.writeFile(forwardZoneFilePath, zoneFileText, (err) => {
    if (err) {
      if (err.errno === -13) {
        return retryAsRoot();
      }
      return console.error(`Error writing '${forwardZoneFilePath}': ${err.message}`);
    }
    return console.log('OK');
  });
}

export function dnsAddZone(args: DnsAddZoneCommandLineArgs): void {
  let lines = '';
  const srcNamedConfLocalPath = '/etc/bind/named.conf.local';
  lineDriver.read({
    in: srcNamedConfLocalPath,
    line: (props, parser) => {
      lines += `${parser.line}\n`;
    },
    close: () => {
      lines += `zone "${args.domainName}" {\n`;
      lines += `    type master;\n`;
      lines += `    file "/etc/bind/db.${args.domainName}";\n`;
      lines += `};\n`;
      lines += `\n`;
      const arpa = args.networkNumber.split('.').reverse().join('.');
      lines += `zone "${arpa}.in-addr.arpa" {\n`;
      lines += `    type master;\n`;
      lines += `    file "/etc/bind/db.${args.networkNumber}";\n`;
      lines += `};\n`;
      fs.writeFile(srcNamedConfLocalPath, lines, (err) => {
        if (err) {
          if (err.errno === -13) {
            return retryAsRoot();
          }
          return console.error(`Error writing '${srcNamedConfLocalPath}': ${err.message}`);
        }
        return console.log('OK');
      });
    },
  });
}

export function dnsServerInstall(): void {
  executeNamedEffortScript('install-dns', (err) => {
    if (err) {
      return console.error(`${err.message}`);
    }
    return console.log('OK');
  });
}

export function dnsServerRestart(): void {
  executeNamedEffortScript('restart-dns', (err) => {
    if (err) {
      return console.error(`${err.message}`);
    }
    return console.log('OK');
  });
}
