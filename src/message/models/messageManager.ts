import type { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import type { components } from '@openapi';
import { SERVICES } from '@common/constants';

export type IMessageModel = components['schemas']['ILogObject'];

@injectable()
export class MessageManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger) {}

  public createMessage(message: IMessageModel): IMessageModel {
    this.logger.info({ msg: 'creating message' });

    return { ...message };
  }
}
