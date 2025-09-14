import type { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import type { components } from '@openapi';
import { SERVICES } from '@common/constants';

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
