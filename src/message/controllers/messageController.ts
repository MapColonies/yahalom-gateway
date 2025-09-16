import type { Logger } from '@map-colonies/js-logger';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { type Registry, Counter } from 'prom-client';
import type { TypedRequestHandlers } from '@openapi';
import { SERVICES } from '@common/constants';
import { MessageManager } from '../models/messageManager';
import { IMessageFilterParams } from './../../common/interfaces';
import { localMesssagesStore } from './../../common/payloads';

@injectable()
export class MessageController {
  private readonly createdMessageCounter: Counter;
  private internalId = 0;

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
    const internalId = ++this.internalId;

    const newMessage = this.manager.createMessage(req.body);
    localMesssagesStore.push(newMessage);

    this.createdMessageCounter.inc(1);
    return res.status(httpStatus.CREATED).json({ id: internalId });
  };

  public getMessages: TypedRequestHandlers['GET /message'] = (req, res) => {
    try {
      const params: IMessageFilterParams = req.query ?? {};
      const filteredMessages = this.manager.getMessages(params);

      if (filteredMessages.length === 0) return res.status(httpStatus.NO_CONTENT).json({ msg: 'No messages found' });

      return res.status(httpStatus.OK).json(filteredMessages);
    } catch (error) {
      this.logger.error({ msg: 'Error retrieving messages', error });
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get messages' });
    }
  };
}
