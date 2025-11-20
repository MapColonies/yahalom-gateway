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

export const invalidMessageInstance = {
  id: 1,
  sessionId: '2234234',
  severity: 'ERROR' as SeverityLevels,
  component: 'MAP' as LogComponent,
  messageType: 'APPEXITED' as AnalyticsMessageTypes,
  message: 'some message',
  timeStamp: '2023-13-27T14:30:00.123Z',
};

export const INVALID_UUID = 'NOT-A-UUID-STRING';

export const NON_EXISTENT_INVALID_ID = '00000000-0000-0000-0000-000000000001';

export const NON_EXISTENT_VALID_ID = '989C6E5C-2CC1-11CA-A044-08002B1BB4F5';
