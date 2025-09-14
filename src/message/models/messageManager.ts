import type { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import type { components } from '@openapi';
import { SERVICES } from '@common/constants';

const messageInstance: IMessageModel = {
  sessionId: 9876543210,
  severity: 'Error',
  timeStamp: '2025-09-11T13:45:00.000Z',
  message: 'Failed to authenticate user.',
  messageParameters: {
    userId: 'user123',
    iP: '192.168.1.10',
    attempt: '3',
    reason: 'Invalid credentials',
  },
  component: 'AuthService',
  messageType: 'Audit',
};

function generateRandomId(): number {
  const rangeOfIds = 100;
  return Math.floor(Math.random() * rangeOfIds);
}

export type IMessageModel = components['schemas']['ILogObject'];

@injectable()
export class MessageManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger) {}

  public createMessage(message: IMessageModel): IMessageModel {
    const messageId = generateRandomId();

    this.logger.info({ msg: 'creating message', messageId });

    return { ...message, sessionId: messageId };
  }
}
