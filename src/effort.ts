import async from 'async';
import path from 'path';
import jsonFile from 'jsonfile';
import { Effort, InitCommandLineArgs } from './interfaces';
import { _spawn } from './spawn';

export function executeEffort(effort: Effort, cb: (err: Error | null | undefined) => void): void {
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
}

export function readNamedEffortScript(
  namedEffortScript: string,
  cb: (err: Error | null, effort: Effort) => void,
): void {
  const scriptFileName = path.join(__dirname, `../common/scripts/${namedEffortScript}.json`);
  jsonFile.readFile(scriptFileName, cb);
}

export function executeNamedEffortScript(namedEffortScript: string, cb: (err: Error | null | undefined) => void): void {
  async.waterfall(
    [
      (_cb: (err: undefined, _namedEffortScript: string) => void) => {
        _cb(undefined, namedEffortScript);
      },
      readNamedEffortScript,
      executeEffort,
    ],
    (err) => (err ? console.error(err.message) : console.log('OK')),
  );
}
