import { components } from '@src/openapi';
import { SeverityLevels, LogComponent, AnalyticsMessageTypes } from './interfaces';

export type IMessageModel = components['schemas']['ILogObject'];

export const messageObjectInstance: IMessageModel = {
  sessionId: 2234234,
  severity: SeverityLevels.ERROR,
  timeStamp: '2025-09-11T13:45:00.000Z',
  message: 'Failed to authenticate user.',
  messageParameters: undefined,
  component: LogComponent.MAP,
  messageType: AnalyticsMessageTypes.APPEXITED,
  id: '1',
};

export const localMesssagesStore: IMessageModel[] = [];
