interface IAnalyticLogParameter {
  userId?: string;
  transactionId?: string;
  errorCode?: number;
  additionalInfo?: object;
  durationMs?: number;
}

enum AnalyticsMessageTypes {
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

enum SeverityLevels {
  EMERGENCY,
  ALERT,
  CRITICAL,
  ERROR,
  WARNING,
  NOTICE,
  INFORMATIONAL,
  DEBUG,
}

enum LogComponent {
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
