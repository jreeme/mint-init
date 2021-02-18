import async from 'async';
import path from 'path';
import jsonFile from 'jsonfile';
import { Effort, InitCommandLineArgs } from './interfaces';
import { _spawn } from './spawn';

export function init(args: InitCommandLineArgs): void {
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
}
