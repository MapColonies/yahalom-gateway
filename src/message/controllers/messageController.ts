import type { Logger } from '@map-colonies/js-logger';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { type Registry, Counter } from 'prom-client';
import type { TypedRequestHandlers } from '@openapi';
import { SERVICES } from '@common/constants';
import { MessageManager, ILogObject } from '../models/messageManager';
import { IQueryModel } from './../../common/interfaces';

@injectable()
export class MessageController {
  private readonly createdMessageCounter: Counter;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(MessageManager) private readonly manager: MessageManager,
    @inject(SERVICES.METRICS) private readonly metricsRegistry: Registry
  ) {
    this.createdMessageCounter = new Counter({
      name: 'created_message',
      help: 'number of created message',
      registers: [this.metricsRegistry],
    });
  }

  public createMessage: TypedRequestHandlers['POST /message'] = (req, res) => {
    try {
      const newMessage = this.manager.createMessage(req.body);

      this.createdMessageCounter.inc(1);
      return res.status(httpStatus.CREATED).json({ id: newMessage.id });
    } catch (error) {
      this.logger.error({ msg: 'Error creating message', error });
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create message' });
    }
  };

  public getMessages: TypedRequestHandlers['GET /message'] = async (req, res) => {
    try {
      const params: IQueryModel = {
        sessionId: req.query?.sessionId as string | undefined,
        component: req.query?.component as string | undefined,
        messageType: req.query?.messageType as string | undefined,
        severity: req.query?.severity as string | undefined,
      };

      const resultMessages: ILogObject[] = await this.manager.getMessages(params);

      return res.status(httpStatus.OK).json(resultMessages);
    } catch (error) {
      this.logger.error({ msg: 'Error retrieving messages', error });
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get messages' });
    }
  };

  public getMessageById: TypedRequestHandlers['GET /message/{id}'] = (req, res) => {
    try {
      const id = req.params.id;

      const message = this.manager.getMessageById(id);

      if (!message) {
        return res.status(httpStatus.NOT_FOUND).json({ message: `No message found with id '${id}'` });
      }

      return res.status(httpStatus.OK).json(message);
    } catch (error) {
      this.logger.error({ msg: 'Error retrieving message', error });
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get message by id' });
    }
  };

  public deleteMessageById: TypedRequestHandlers['DELETE /message/{id}'] = (req, res) => {
    try {
      const id = req.params.id;

      const isDeleted = this.manager.tryDeleteMessageById(id);

      if (!isDeleted) {
        return res.status(httpStatus.NOT_FOUND).json({ message: `No message found to delete with id '${id}'` });
      }

      return res.status(httpStatus.OK).json();
    } catch (error) {
      this.logger.error({ msg: 'Error retrieving message', error });
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete message' });
    }
  };

  public patchMessageById: TypedRequestHandlers['PATCH /message/{id}'] = (req, res) => {
    try {
      const id = req.params.id;
      const messageChanges = req.body as ILogObject | undefined;

      if (!messageChanges || Object.keys(messageChanges).length === 0) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: `No params found to patch with id '${id}'` });
      }

      const updatedMessage = this.manager.patchMessageById(id, messageChanges);

      if (!updatedMessage) {
        return res.status(httpStatus.NOT_FOUND).json({ message: `No message found with id '${id}'` });
      }

      return res.status(httpStatus.OK).json(updatedMessage);
    } catch (error) {
      this.logger.error({ msg: 'Error retrieving message', error });
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to patch message' });
    }
  };
}
