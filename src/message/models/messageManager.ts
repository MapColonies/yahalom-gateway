import type { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import type { components } from '@openapi';
import { SERVICES } from '@common/constants';
import { IQueryModel } from './../../common/interfaces';
import { localMesssagesStore } from './../../common/payloads';

export type ILogObject = components['schemas']['ILogObject'];

@injectable()
export class MessageManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger) {}

  public createMessage(message: Omit<ILogObject, 'id'>): ILogObject {
    this.logger.info({ msg: 'creating message' });
    this.logger.debug({ msg: 'message recieved details', message });

    const id = uuidv4();

    const newMessage: ILogObject = { ...message, id };

    localMesssagesStore.push(newMessage);

    return newMessage;
  }

  public getMessages(params: IQueryModel): ILogObject[] {
    this.logger.info({ msg: 'getting filtered messages with query params: ', params });

    const { sessionId, severity, component, messageType } = params;

    const allMessages: ILogObject[] = localMesssagesStore;

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
