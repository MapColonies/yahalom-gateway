import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

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
  sessionId: string;
  severity: SeverityLevels;
  timeStamp: string;
  message: string;
  messageParameters?: { [key: string]: unknown } | undefined;
  component: LogComponent;
  messageType: AnalyticsMessageTypes;
  id: string;
}

export interface IQueryModel {
  severity?: string;
  component?: string;
  messageType?: string;
  sessionId?: string;
}

export interface DbConfig extends PostgresConnectionOptions {
  host: string;
  port: number;
  username: string;
  password?: string;
  name: string;
  enableSslAuth?: boolean;
  sslPaths?: {
    ca: string;
    cert: string;
    key: string;
  };
}
