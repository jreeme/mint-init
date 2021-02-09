export interface CommandLineArgs {
  help: boolean;
  version: boolean;
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
