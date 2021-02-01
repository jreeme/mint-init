#!/usr/bin/env node
import async from 'async';
import { Command } from 'commander';
import pkgInfo from 'pkginfo';
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
  .option('-s, --silent', 'No console output');

command.parse();

// const args = <CommandLineArgs>command.opts();

async.waterfall(
  [
    (cb: (err: Error | undefined, effort: Effort) => void) => {
      const effort = <Effort>{
        jobs: [
          {
            serialTasks: [
              {
                description: ``,
                bashCommandLine: ``,
              },
              {
                description: 'An Error',
                bashCommandLine: `>&2 echo hello ; exit 1`,
              },
            ],
            parallelTasks: [
              {
                description: `Get WebStorm`,
                bashCommandLine: `curl -O https://download-cf.jetbrains.com/webstorm/WebStorm-2020.3.2.tar.gz`,
              },
              {
                description: `Get NVM`,
                bashCommandLine: `curl -O https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh`,
              },
              {
                description: `Get docker-compose`,
                bashCommandLine: `sudo curl -L "https://github.com/docker/compose/releases/download/1.28.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`,
              },
              {
                description: `Download Chrome DEB file for later installation`,
                bashCommandLine: `curl -O https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb`,
              },
              {
                description: `Add docker gpg key`,
                bashCommandLine: `curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=TRUE apt-key add -`,
              },
              {
                description: `Add some aliases and such to ~/.bashrc file`,
                bashCommandLine: `{ echo "alias h='history'" ; echo "alias d='docker'" ; echo "alias x='xrae-core'" ; echo "shopt -s dotglob" ; echo "set -o vi" ; } | tee -a ~/.bashrc`,
              },
              {
                description: `Set vi(m) as default editor`,
                bashCommandLine: `sudo update-alternatives --set editor /usr/bin/vim.tiny`,
              },
              {
                description: `Create script to enable 'git' credential caching`,
                bashCommandLine: `{ echo "#!/usr/bin/env bash" ; echo "git config --global credential.helper store" ; } | tee ~/_cache-git-credentials.sh`,
              },
              {
                description: `Show line number when using vi(m)`,
                bashCommandLine: `echo 'set nu' | tee ~/.vimrc`,
              },
              {
                description: `Require no password for 'sudo' execution`,
                bashCommandLine: `echo "\${USER} ALL=(ALL) NOPASSWD: ALL" | sudo EDITOR='tee -a' visudo`,
              },
              {
                description: `Create script to swap 'Esc' & 'CapsLock' keys. Makes things easier for people that use vi(m)`,
                bashCommandLine: `{ echo "#!/usr/bin/env bash" ; echo "setxkbmap -option caps:swapescape" ; } | tee ~/_swapEsc.sh`,
              },
            ],
          },
          {
            serialTasks: [],
            parallelTasks: [
              {
                description: `Set script files permissions to 755`,
                bashCommandLine: `chmod 755 ~/_swapEsc.sh ~/_cache-git-credentials.sh`,
              },
            ],
          },
        ],
      };
      cb(undefined, effort);
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
