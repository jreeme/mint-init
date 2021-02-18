import fs from 'fs';
import find from 'find';
import async from 'async';
import yaml from 'yamljs';
import { NetplanStaticCommandLineArgs } from './interfaces';
import { retryAsRoot } from './sudo';

export function writeNetPlan(args: NetplanStaticCommandLineArgs): void {
  async.waterfall(
    [
      (cb: (err: undefined, yamlFile: string) => void) => {
        cb(undefined, args.yamlFile);
      },
      (yamlFile: string, cb: (err: Error | undefined, _yamlFile: string) => void) => {
        if (yamlFile) {
          cb(undefined, yamlFile);
          return;
        }
        find.file(/\.yaml$/, '/etc/netplan', (files) => {
          if (!files.length) {
            console.error('No NetPlan YAML files found');
            return;
          }
          if (files.length > 1 && !args.yamlFile) {
            console.error('\nMultiple NetPlan files found. Use --yaml-file to specify target.');
            console.dir(files);
            console.error('\n');
            return;
          }
          cb(undefined, files[0]);
        });
      },
      (yamlFile: string, cb: (err: Error | undefined) => void) => {
        const netPlay: { network: { ethernets: any; renderer: string } } = yaml.load(yamlFile);
        netPlay.network.ethernets = netPlay.network.ethernets || {};
        const keys = Object.keys(netPlay.network.ethernets);
        if (keys.length > 1) {
          cb(new Error(`'network.ethernets' has '${keys.length}' keys. Expecting 1`));
          return;
        }
        const nic = {
          dhcp4: 'no',
          addresses: [args.staticIp],
          gateway4: args.gateway,
          nameservers: { addresses: [...args.nameServers] },
        };
        netPlay.network.renderer = 'networkd';
        netPlay.network.ethernets[args.nicName] = { ...nic };

        const netPlayYamlString = yaml.stringify(netPlay, 8, 2);
        fs.writeFile(yamlFile, netPlayYamlString, (err) => {
          if (err) {
            if (err.errno === -13) {
              return retryAsRoot();
            }
            console.error(`Error writing YAML file '${yamlFile}': ${err.message}`);
            return cb(err);
          }
          return cb(undefined);
        });
      },
    ],
    (err): void => {
      if (err) {
        return console.error(`NetPlan update FAILED: ${err.message}`);
      }
      return console.log('OK');
    },
  );
}
