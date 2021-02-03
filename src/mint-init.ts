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
                description: `Prime 'sudo' at the beginning for unattended install`,
                bashCommandLine: `sudo ls`,
              },
              /*
              {
                description: 'An Error',
                bashCommandLine: `>&2 echo hello ; exit 1`,
              },
*/
            ],
            parallelTasks: [
              {
                description: `Add docker aptitude repo for Ubuntu 'focal'`,
                bashCommandLine: `echo "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable" | sudo tee -a /etc/apt/sources.list.d/docker.list`,
              },
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
                description: `Install WebStorm`,
                bashCommandLine: `tar -C ~/ -xvf ./WebStorm-2020.3.2.tar.gz ; rm ./WebStorm-2020.3.2.tar.gz`,
              },
              {
                description: `Install NVM`,
                bashCommandLine: `bash ./install.sh`,
              },
              {
                description: `Update Aptitude database`,
                bashCommandLine: `sudo apt-get update`,
              },
            ],
          },
          {
            serialTasks: [
              {
                description: `Add apt-fast to speed apt-get - Step 1`,
                bashCommandLine: `{ echo "deb http://ppa.launchpad.net/apt-fast/stable/ubuntu focal main" ; echo "deb-src http://ppa.launchpad.net/apt-fast/stable/ubuntu focal main" ; } | sudo tee /etc/apt/sources.list.d/apt-fast.list`,
              },
              {
                description: `Add apt-fast to speed apt-get - Step 2`,
                bashCommandLine: `sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys A2166B8DE8BDC3367D1901C11EE2FF37CA8DA16B`,
              },
              {
                description: `Add apt-fast to speed apt-get - Step 3`,
                bashCommandLine: `sudo apt-get update ; sudo DEBIAN_FRONTEND=noninteractive apt-get install -y apt-fast`,
              },
            ],
            parallelTasks: [
              {
                description: `Up the stack & heap for WebStorm`,
                bashCommandLine: `sed -i 's/Xms128m/Xms1024m/ ; s/Xmx750m/Xmx4096m/' ./WebStorm-203.7148.54/bin/webstorm64.vmoptions`,
              },
              {
                description: `Install Aptitude packages`,
                bashCommandLine: `sudo apt-fast install -y ./google-chrome-stable_current_amd64.deb apt-transport-https ca-certificates curl gnupg-agent software-properties-common docker-ce docker-ce-cli containerd.io git openssh-server`,
              },
            ],
          },
          {
            serialTasks: [
              {
                description: `Create menu entry for WebStorm - Step 1`,
                bashCommandLine: `{ echo "[Desktop Entry]" ; echo "Name=WebStorm" ; echo "Exec=\${HOME}/WebStorm-203.7148.54/bin/webstorm.sh" ; } | tee ~/.local/share/applications/webstorm.desktop`,
              },
              {
                description: `Create menu entry for WebStorm - Step 2`,
                bashCommandLine: `{ echo "Comment=2020.3" ; echo "Terminal=false" ; } | tee -a ~/.local/share/applications/webstorm.desktop`,
              },
              {
                description: `Create menu entry for WebStorm - Step 3`,
                bashCommandLine: `{ echo "Icon=\${HOME}/WebStorm-203.7148.54/bin/webstorm.svg" ; echo "Type=Application" ; } | tee -a ~/.local/share/applications/webstorm.desktop`,
              },
            ],
            parallelTasks: [
              {
                description: `Add $USER to 'docker' group`,
                bashCommandLine: `sudo usermod -aG docker \${USER}`,
              },
              {
                description: `Set script files permissions to 755`,
                bashCommandLine: `sudo chmod 755 /usr/local/bin/docker-compose`,
              },
              {
                description: `Set script files permissions to 755`,
                bashCommandLine: `chmod 755 ~/_swapEsc.sh ~/_cache-git-credentials.sh`,
              },
              {
                description: `Configure NVM Operation 1`,
                bashCommandLine: `export NVM_DIR="$HOME/.nvm" ; [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh" ; nvm install 13`,
              },
              {
                description: `Configure NVM Operation 2`,
                bashCommandLine: `export NVM_DIR="$HOME/.nvm" ; [ -s "$NVM_DIR/bash_completion" ] && \\. "$NVM_DIR/bash_completion"`,
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
