import { components } from '@src/openapi';
import { SeverityLevels, LogComponent, AnalyticsMessageTypes } from '../../src/common/interfaces';

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

export const fullQueryParamsInstnace = {
  sessionId: '2234234',
  severity: 'ERROR' as SeverityLevels,
  component: 'MAP' as LogComponent,
  messageType: 'APPEXITED' as AnalyticsMessageTypes,
};

export const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000001';
