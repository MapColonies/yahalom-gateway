import type { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import type { components } from '@openapi';
import { SERVICES, NOT_FOUND, QUERY_BUILDER_NAME } from '@common/constants';
import { localMessagesStore } from '../../common/mocks';
import { messageLogsDataSource } from '../../DAL/messageLogsSource';
import { message } from '../../DAL/entities/message';
import { IQueryModel } from './../../common/interfaces';
import { mapMessageToILogObject } from './../../utils/helpers';

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

  public async getMessages(params: IQueryModel): Promise<ILogObject[]> {
    this.logger.info({ msg: 'getting filtered messages with query params: ', params });

    const { sessionId, severity, component, messageType } = params;

    const queryBuilder = messageLogsDataSource.getRepository(message).createQueryBuilder(QUERY_BUILDER_NAME);

    if (severity != null) {
      queryBuilder.andWhere('log.severity = :severity', { severity });
    }

    if (component != null) {
      queryBuilder.andWhere('log.component = :component', { component });
    }

    if (messageType != null) {
      queryBuilder.andWhere('log.messageType = :messageType', { messageType });
    }

    if (sessionId != null) {
      queryBuilder.andWhere('log.sessionId = :sessionId', { sessionId });
    }

    const resultMessages = await queryBuilder.getMany();

    return resultMessages.map(mapMessageToILogObject);
  }

  public getMessageById(id: string): ILogObject | undefined {
    this.logger.info({ msg: `Getting message by ID - ${id}`, id });

    const message = localMessagesStore.find((message) => message.id === id);
    return message;
  }

  public tryDeleteMessageById(id: string): boolean {
    this.logger.info({ msg: `Deleting message by ID - ${id}`, id });

    const index = localMessagesStore.findIndex((message) => message.id === id);

    if (index !== NOT_FOUND) {
      localMessagesStore.splice(index, 1);
      return true;
    }

    return false;
  }

  public patchMessageById(id: string, messageChanges: ILogObject): ILogObject | undefined {
    this.logger.info({ msg: `Pathcing message by ID - ${id}`, id });

    const index = localMessagesStore.findIndex((message) => message.id === id);

    if (index !== NOT_FOUND) {
      localMessagesStore[index] = { ...localMessagesStore[index], ...messageChanges };

      const updatedMessage = localMessagesStore[index];
      return updatedMessage;
    }

    return undefined;
  }
}
