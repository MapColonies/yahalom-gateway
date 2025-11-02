import type { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import type { components } from '@openapi';
import { SERVICES, NOT_FOUND, QUERY_BUILDER_NAME } from '@common/constants';
import { localMessagesStore } from '../../common/localMocks';
import { Message } from '../../DAL/entities/message';
import { ConnectionManager } from '../../DAL/connectionManager';
import { IQueryModel } from './../../common/interfaces';
import { mapMessageToILogObject } from './../../utils/helpers';

export type ILogObject = components['schemas']['ILogObject'];

@injectable()
export class MessageManager {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.CONNECTION_MANAGER) private readonly connectionManager: ConnectionManager
  ) {}

  public createMessage(message: Omit<ILogObject, 'id'>): ILogObject {
    this.logger.info({ msg: 'creating message' });
    this.logger.debug({ msg: 'message recieved details', message });

    const id = uuidv4();

    const newMessage: ILogObject = { ...message, id };

    localMessagesStore.push(newMessage);

    return newMessage;
  }

  public async getMessages(params: IQueryModel): Promise<ILogObject[]> {
    this.logger.info({ msg: 'Getting filtered messages with query params: ', params });

    return this.withRepository(Message, async (repo) => {
      if (Object.keys(params).length === 0) {
        const rawMessages = await repo.find();
        return rawMessages.map(mapMessageToILogObject);
      }

      const { sessionId, severity, component, messageType } = params;
      const queryBuilder = repo.createQueryBuilder(QUERY_BUILDER_NAME);

      this.andWhere(queryBuilder, `${QUERY_BUILDER_NAME}.severity`, severity);
      this.andWhere(queryBuilder, `${QUERY_BUILDER_NAME}.component`, component);
      this.andWhere(queryBuilder, `${QUERY_BUILDER_NAME}.messageType`, messageType);
      this.andWhere(queryBuilder, `${QUERY_BUILDER_NAME}.sessionId`, sessionId);

      const resultMessages = await queryBuilder.getMany();
      return resultMessages.map(mapMessageToILogObject);
    });
  }

  public async getMessageById(id: string): Promise<ILogObject | undefined> {
    this.logger.info({ msg: `Getting message by ID - ${id}`, id });

    return this.withRepository(Message, async (repo) => {
      const message = await repo.findOne({ where: { id } });

      if (!message) {
        this.logger.warn({ msg: `No message found with ID: ${id}`, id });
        return undefined;
      }

      return mapMessageToILogObject(message);
    });
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

  private andWhere(queryBuilder: SelectQueryBuilder<Message>, field: string, value: string | number | null | undefined): void {
    if (value != null) {
      const paramName = field.split('.').pop() ?? field;
      queryBuilder.andWhere(`${field} = :${paramName}`, { [paramName]: value });
    }
  }

  private async withRepository<T extends ObjectLiteral, R>(entity: { new (): T }, action: (repo: Repository<T>) => Promise<R>): Promise<R> {
    let connection;
    let repo: Repository<T>;

    try {
      connection = this.connectionManager.getConnection();
      repo = connection.getRepository(entity);
    } catch (error) {
      this.logger.error({ msg: 'Error getting DB connection:', error });
      throw new Error('Cannot get repository because the DB connection is unavailable');
    }

    try {
      return await action(repo);
    } catch (error) {
      this.logger.error({ msg: 'Error while executing repository action:', error });
      throw error;
    }
  }
}
