import type { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import type { components } from '@openapi';
import { SERVICES } from '@common/constants';
import { IMessageFilterParams } from './../../common/interfaces';
import { localMesssagesStore } from './../../common/payloads';

export type IMessageModel = components['schemas']['ILogObject'];

@injectable()
export class MessageManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger) {}

  public createMessage(message: IMessageModel): IMessageModel {
    this.logger.info({ msg: 'creating message' });

    return { ...message };
  }

  public getMessages(params: IMessageFilterParams): IMessageModel[] {
    this.logger.info({ msg: 'getting filtered messages' });

    const { sessionId, severity, component, messageType } = params;

    const allMessages: IMessageModel[] = localMesssagesStore;

    const filteredMessages = allMessages.filter((instance) => {
      if (severity != null && instance.severity !== severity) return false;
      if (component != null && instance.component !== component) return false;
      if (messageType != null && instance.messageType !== messageType) return false;
      if (sessionId != null && instance.sessionId !== sessionId) return false;
      return true;
    });

    return filteredMessages;
  }
}
