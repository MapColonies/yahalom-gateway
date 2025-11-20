import type { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import { DeepPartial, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import type { components } from '@openapi';
import { SERVICES, QUERY_BUILDER_NAME } from '@common/constants';
import { Message } from '@src/DAL/entities/message';
import { ConnectionManager } from '@src/DAL/connectionManager';
import { IQueryModel, LogContext } from '@src/common/interfaces';
import { mapMessageToILogObject } from './../../utils/helpers';

export type ILogObject = components['schemas']['ILogObject'];

@injectable()
export class MessageManager {
  private readonly logContext: LogContext;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.CONNECTION_MANAGER) private readonly connectionManager: ConnectionManager
  ) {
    this.logContext = { fileName: __filename, class: MessageManager.name };
  }

  public async createMessage(message: Omit<ILogObject, 'id'>): Promise<ILogObject> {
    const logContext = { ...this.logContext, function: this.createMessage.name };
    this.logger.debug({ msg: 'message recieved details', message, logContext });

    const id = uuidv4();
    const newMessage: ILogObject = { ...message, id };

    const repo = this.getRepo(Message);

    const entity = repo.create(newMessage as DeepPartial<Message>);
    await repo.save(entity);
    const formatedNewMessage = mapMessageToILogObject(entity);

    return formatedNewMessage;
  }

  public async getMessages(params: IQueryModel): Promise<ILogObject[]> {
    const logContext = { ...this.logContext, function: this.getMessages.name };
    this.logger.info({ msg: 'getting filtered messages with query params: ', params, logContext });

    const repo = this.getRepo(Message);

    if (Object.keys(params).length === 0) {
      const rawMessages = await repo.find();
      const formatedResultMessages: ILogObject[] = rawMessages.map(mapMessageToILogObject);

      return formatedResultMessages;
    }

    const { sessionId, severity, component, messageType } = params;

    const queryBuilder = repo.createQueryBuilder(QUERY_BUILDER_NAME);
    this.andWhere(queryBuilder, `${QUERY_BUILDER_NAME}.severity`, severity);
    this.andWhere(queryBuilder, `${QUERY_BUILDER_NAME}.component`, component);
    this.andWhere(queryBuilder, `${QUERY_BUILDER_NAME}.messageType`, messageType);
    this.andWhere(queryBuilder, `${QUERY_BUILDER_NAME}.sessionId`, sessionId);

    const resultMessages = await queryBuilder.getMany();
    const formatedResultMessages: ILogObject[] = resultMessages.map(mapMessageToILogObject);

    return formatedResultMessages;
  }

  public async getMessageById(id: string): Promise<ILogObject | undefined> {
    const logContext = { ...this.logContext, function: this.getMessageById.name };
    this.logger.info({ msg: `Getting message by ID - ${id}`, id, logContext });

    const repo = this.getRepo(Message);

    const message = await repo.findOne({ where: { id } });

    if (!message) {
      this.logger.debug({ msg: `No message found with ID: ${id}`, id, logContext });
      return undefined;
    }

    const foundMessage: ILogObject = mapMessageToILogObject(message);

    return foundMessage;
  }

  public async patchMessageById(id: string, messageChanges: Partial<ILogObject>): Promise<ILogObject | undefined> {
    const logContext = { ...this.logContext, function: this.patchMessageById.name };
    this.logger.info({ msg: `Patching message by ID - ${id}`, id, messageChanges, logContext });

    const repo = this.getRepo(Message);

    const existingMessage = await repo.findOne({ where: { id } });

    if (!existingMessage) {
      this.logger.warn({ msg: `No message found with ID: ${id}`, id, logContext });
      return undefined;
    }

    const updatedMessageEntity = repo.merge(existingMessage, messageChanges as DeepPartial<Message>);
    const savedMessage = await repo.save(updatedMessageEntity);

    this.logger.info({ msg: `Message with ID ${id} updated successfully`, id, logContext });

    const updatedMessage: ILogObject = mapMessageToILogObject(savedMessage);

    return updatedMessage;
  }

  public async tryDeleteMessageById(id: string): Promise<boolean> {
    const logContext = { ...this.logContext, function: this.tryDeleteMessageById.name };
    this.logger.info({ msg: `Deleting message by ID - ${id}`, id, logContext });

    const repo = this.getRepo(Message);

    const result = await repo.delete({ id });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const affected = result?.affected ?? 0;

    if (affected > 0) {
      this.logger.info({ msg: `Message with ID ${id} deleted successfully.` });
      return true;
    } else {
      this.logger.info({ msg: `No message found to delete with ID ${id}.` });
      return false;
    }
  }

  private andWhere(queryBuilder: SelectQueryBuilder<Message>, field: string, value: string | number | null | undefined): void {
    if (value != null) {
      const paramName = field.split('.').pop() ?? field;
      queryBuilder.andWhere(`${field} = :${paramName}`, { [paramName]: value });
    }
  }

  private getRepo<T extends ObjectLiteral>(entity: { new (): T }): Repository<T> {
    let connection;
    let repo: Repository<T>;

    try {
      connection = this.connectionManager.getConnection();
      repo = connection.getRepository(entity);
      return repo;
    } catch (error) {
      this.logger.error({ msg: `Error getting DB connection for entity ${entity.name}:`, error });
      throw new Error(`Cannot get repository for entity ${entity.name} because the DB connection is unavailable`);
    }
  }
}
