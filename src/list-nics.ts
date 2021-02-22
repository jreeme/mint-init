import os from 'os';

export function listNics(): void {
  const nics = os.networkInterfaces();
  delete nics.lo;
  const keys = Object.keys(nics);
  keys.forEach((key) => {
    nics[key]?.forEach((nicInfo) => {
      if (nicInfo.family === 'IPv4') {
        console.dir({ name: key, cidr: nicInfo.cidr, mac: nicInfo.mac });
      }
    });
  });
  process.exit();
}
