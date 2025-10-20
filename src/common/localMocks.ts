import { components } from '@src/openapi';

export type IMessageModel = components['schemas']['ILogObject'];

// TODO: delete this row when real database will appear
export const localMessagesStore: IMessageModel[] = [];
