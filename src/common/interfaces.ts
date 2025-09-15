interface IAnalyticLogParameter {
  userId?: string;
  transactionId?: string;
  errorCode?: number;
  additionalInfo?: object;
  durationMs?: number;
}

export enum AnalyticsMessageTypes {
  APPSTARTED = 'APPSTARTED',
  APPEXITED = 'APPEXITED',
  USERDETAILS = 'USERDETAILS',
  USERMACHINESPEC = 'USERMACHINESPEC',
  USERDEVICES = 'USERDEVICES',
  DEVICECONNECTED = 'DEVICECONNECTED',
  DEVICEDISCONNECTED = 'DEVICEDISCONNECTED',
  GAMEMODESTARTED = 'GAMEMODESTARTED',
  GAMEMODEENDED = 'GAMEMODEENDED',
  IDLETIMESTARTED = 'IDLETIMESTARTED',
  IDLETIMEENDED = 'IDLETIMEENDED',
  LAYERUSESTARTED = 'LAYERUSESTARTED',
  LAYERUSERENDED = 'LAYERUSERENDED',
  MULTIPLAYERSTARTED = 'MULTIPLAYERSTARTED',
  MULTIPLAYERENDED = 'MULTIPLAYERENDED',
  LOCATION = 'LOCATION',
  ERROR = 'ERROR',
  GENERALINFO = 'GENERALINFO',
  WARNING = 'WARNING',
  CONSUMPTIONSTATUS = 'CONSUMPTIONSTATUS',
  APPLICATIONDATA = 'APPLICATIONDATA',
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
  GENERAL = 'GENERAL',
  MAP = 'MAP',
  FTUE = 'FTUE',
  SIMULATOR = 'SIMULATOR',
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

export interface IMessageFilterParams {
  severity?: string;
  component?: string;
  messageType?: string;
  sessionId?: number;
}
