export interface NetplanStaticCommandLineArgs {
  nicName: string;
  yamlFile: string;
  staticIp: string;
  gateway: string;
  nameServers: string[];
}

export interface DnsOptionsCommandLineArgs {
  forwarders: string[];
  recursionNets: string[];
}

export interface DnsAddZoneCommandLineArgs {
  domainName: string;
  networkNumber: string;
}

export interface DnsAddZoneFileCommandLineArgs extends DnsAddZoneCommandLineArgs {
  nameServerIp: string;
}

export interface InitCommandLineArgs {
  silent: boolean;
  scriptName: string;
}

export interface Task {
  description: string;
  command?: string;
  args?: ReadonlyArray<string>;
  bashCommandLine?: string;
}

export interface Job {
  serialTasks: Task[];
  parallelTasks: Task[];
}

export interface Effort {
  jobs: Job[];
}
