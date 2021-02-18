import sudo from 'sudo-prompt';

export function retryAsRoot(): void {
  const argv = [...process.argv];
  const commandLine = argv.join(' ');
  sudo.exec(commandLine, { name: 'mintinit' }, (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stderr);
    console.log(stdout);
  });
}
