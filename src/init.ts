import { InitCommandLineArgs } from './interfaces';
import { executeNamedEffortScript } from './effort';

export function init(args: InitCommandLineArgs): void {
  executeNamedEffortScript(args.scriptName, (err) => {
    if (err) {
      return console.error(err.message);
    }
    return console.log('OK');
  });
}
