import type { Logger } from '@map-colonies/js-logger';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { type Registry, Counter } from 'prom-client';
import type { TypedRequestHandlers } from '@openapi';
import { SERVICES } from '@common/constants';
import { MessageManager } from '../models/messageManager';

const uniqueSessionIds: Set<number> = new Set<number>();

function hasSessionId(sessionId: number): boolean {
  return uniqueSessionIds.has(sessionId);
}

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
    if (hasSessionId(req.body.sessionId)) return res.status(httpStatus.BAD_REQUEST).json({ error: 'sessionId should be unique' });

    const internalId = ++this.internalId;

    const createdMessage = this.manager.createMessage(req.body);
    uniqueSessionIds.add(createdMessage.sessionId);

    this.createdMessageCounter.inc(1);
    return res.status(httpStatus.CREATED).json({ id: internalId });
  };
}
