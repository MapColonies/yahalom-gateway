interface IAnalyticLogParameter {
  userId?: string;
  transactionId?: string;
  errorCode?: number;
  additionalInfo?: object;
  durationMs?: number;
}

export enum AnalyticsMessageTypes {
  APPSTARTED,
  APPEXITED,
  USERDETAILS,
  USERMACHINESPEC,
  USERDEVICES,
  DEVICECONNECTED,
  DEVICEDISCONNECTED,
  GAMEMODESTARTED,
  GAMEMODEENDED,
  IDLETIMESTARTED,
  IDLETIMEENDED,
  LAYERUSESTARTED,
  LAYERUSERENDED,
  MULTIPLAYERSTARTED,
  MULTIPLAYERENDED,
  LOCATION,
  ERROR,
  GENERALINFO,
  WARNING,
  CONSUMPTIONSTATUS,
  APPLICATIONDATA,
}

export enum SeverityLevels {
  EMERGENCY = 'EMERGENCY',
  ALERT = 'ALERT',
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  NOTICE = 'NOTICE',
  INFORMATIONAL = 'INFORMATIONAL',
  DEBUG = 'DEBUG',
}

export enum LogComponent {
  GENERAL,
  MAP,
  FTUE,
  SIMULATOR,
}

export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export interface ILogObject {
  sessionId: bigint;
  severity: SeverityLevels;
  timeStamp: Date;
  message: string;
  messageParameters?: IAnalyticLogParameter;
  component: LogComponent;
  messageType: AnalyticsMessageTypes;
}
