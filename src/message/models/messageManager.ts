import type { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import type { components } from '@openapi';
import { SERVICES } from '@common/constants';
import { localMessagesStore } from '../../common/mocks';
import { IQueryModel } from './../../common/interfaces';

export type ILogObject = components['schemas']['ILogObject'];

@injectable()
export class MessageManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger) {}

  public createMessage(message: Omit<ILogObject, 'id'>): ILogObject {
    this.logger.info({ msg: 'creating message' });
    this.logger.debug({ msg: 'message recieved details', message });

    const id = uuidv4();

    const newMessage: ILogObject = { ...message, id };

    localMessagesStore.push(newMessage);

    return newMessage;
  }

  public getMessages(params: IQueryModel): ILogObject[] {
    this.logger.info({ msg: 'getting filtered messages with query params: ', params });

    const { sessionId, severity, component, messageType } = params;

    const allMessages: ILogObject[] = localMessagesStore;

    const filteredMessages = allMessages.filter((instance) => {
      if (severity != null && instance.severity !== severity) return false;
      if (component != null && instance.component !== component) return false;
      if (messageType != null && instance.messageType !== messageType) return false;
      if (sessionId != null && instance.sessionId !== sessionId) return false;
      return true;
    });

    return filteredMessages;
  }

  public getMessageById(id: string): ILogObject | undefined {
    this.logger.info({ msg: `Getting message by ID - ${id}`, id });

    const message = localMessagesStore.find((message) => message.id === id);
    return message ?? undefined;
  }

  public deleteMessageById(id: string): ILogObject | undefined {
    this.logger.info({ msg: `Deleting message by ID - ${id}` });

    const index = localMessagesStore.findIndex((message) => message.id === id);

    const NOT_FOUND = -1;
    if (index !== NOT_FOUND) {
      const [deletedMessage] = localMessagesStore.splice(index, 1);
      return deletedMessage;
    }

    return undefined;
  }
}
