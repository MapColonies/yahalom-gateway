import { components } from '@src/openapi';
import { SeverityLevels, LogComponent, AnalyticsMessageTypes, IQueryModel } from './interfaces';

export type IMessageModel = components['schemas']['ILogObject'];

export const fullMessageInstance: IMessageModel = {
  id: '1',
  sessionId: '2234234',
  severity: 'ERROR' as SeverityLevels,
  component: 'MAP' as LogComponent,
  messageType: 'APPEXITED' as AnalyticsMessageTypes,
  message: 'some message',
  timeStamp: new Date().toISOString(),
};

// TODO: delete this row when real database will appear
export const localMessagesStore: IMessageModel[] = [];

export const fullQueryParamsInstnace: IQueryModel = {
  sessionId: '2234234',
  severity: 'ERROR',
  component: 'MAP',
  messageType: 'APPEXITED',
};
