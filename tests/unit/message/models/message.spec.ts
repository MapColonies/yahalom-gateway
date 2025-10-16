import 'reflect-metadata';
import jsLogger from '@map-colonies/js-logger';
import { MessageManager } from '@src/message/models/messageManager';
import { messageLogsDataSource } from '@src/DAL/messageLogsSource';
import { Message } from '@src/DAL/entities/Message';
import { getResponseMessage, localMessagesStore } from '../../../../src/common/mocks';
import { IQueryModel, ILogObject, SeverityLevels, LogComponent, AnalyticsMessageTypes } from './../../../../src/common/interfaces';

let messageManager: MessageManager;

jest.mock('@src/DAL/messageLogsSource', () => {
  return {
    messageLogsDataSource: {
      getRepository: jest.fn(),
    },
  };
});

const mockAndWhere = jest.fn().mockReturnThis();
const mockGetMany = jest.fn();

const mockCreateQueryBuilder = jest.fn().mockReturnValue({
  andWhere: mockAndWhere,
  getMany: mockGetMany,
});
const mockRepository = {
  createQueryBuilder: mockCreateQueryBuilder,
};

describe('MessageManager', () => {
  beforeEach(() => {
    messageManager = new MessageManager(jsLogger({ enabled: false }));
    localMessagesStore.length = 0; // clear the store before each test
  });

  describe('#createMessage', () => {
    it('should return the created message', () => {
      const message = messageManager.createMessage(getResponseMessage);
      expect(message.sessionId).toBe(2234234);
    });
  });

  describe('#getMessages', () => {
    beforeEach(() => {
      messageManager = new MessageManager(jsLogger({ enabled: false }));
      localMessagesStore.push(getResponseMessage); // for testing the quary, should be replaced when adding db

      mockAndWhere.mockClear();
      mockGetMany.mockClear();
      mockCreateQueryBuilder.mockClear();

      (messageLogsDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity === Message) {
          return mockRepository;
        }
        return null;
      });
    });

    it('should return messages filtered by all parameters', async () => {
      const fakeMessage: Partial<ILogObject> = {
        id: '1',
        sessionId: 123,
        severity: 'ERROR' as SeverityLevels,
        component: 'MAP' as LogComponent,
        messageType: 'APPEXITED' as AnalyticsMessageTypes,
        message: 'some message',
        timeStamp: new Date().toISOString(),
      };

      mockGetMany.mockResolvedValue([fakeMessage]);

      const query: IQueryModel = {
        sessionId: 123,
        severity: 'ERROR',
        component: 'MAP',
        messageType: 'APPEXITED',
      };

      const result = await messageManager.getMessages(query);

      expect(mockCreateQueryBuilder).toHaveBeenCalledWith('log');
      expect(mockAndWhere).toHaveBeenCalledTimes(4);
      expect(mockGetMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('message', 'some message');
    });

    it('should build query with only provided filters', async () => {
      const fakeMessage: Partial<ILogObject> = {
        id: '2',
        sessionId: 321,
        message: 'filtered by severity only',
        severity: 'INFO' as SeverityLevels,
        timeStamp: new Date().toISOString(),
      };

      mockGetMany.mockResolvedValue([fakeMessage]);

      const query: IQueryModel = {
        severity: 'INFO',
      };

      const result = await messageManager.getMessages(query);

      expect(mockCreateQueryBuilder).toHaveBeenCalledWith('log');
      expect(mockAndWhere).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('severity', 'INFO');
    });

    it('should return an empty array if no messages match', async () => {
      mockGetMany.mockResolvedValue([]);

      const result = await messageManager.getMessages({ sessionId: 999 });

      expect(result).toEqual([]);
    });

    it('should return the message with the given Id', () => {
      const message = messageManager.getMessageById(getResponseMessage.id);
      expect(message).toEqual(getResponseMessage);
    });

    it('should return null if no message with the given Id exists for get request', () => {
      const message = messageManager.getMessageById('non-existent-id');
      expect(message).toBeUndefined();
    });

    it('should return true for the deleted message', () => {
      const message = messageManager.tryDeleteMessageById(getResponseMessage.id);
      expect(message).toBeTruthy();
    });

    it('should return null if no message with the given Id exists for delete request', () => {
      const message = messageManager.tryDeleteMessageById('non-existent-id');
      expect(message).toBeFalsy();
    });

    it('should return the updated message', () => {
      const patch: Partial<ILogObject> = {
        message: 'updated',
      };

      const updated = messageManager.patchMessageById('1', patch as ILogObject);
      expect(updated).toHaveProperty('message', 'updated');
    });

    it('should return undefined if message Id does not exist', () => {
      const patch: Partial<ILogObject> = {
        message: 'nope',
      };

      const result = messageManager.patchMessageById('999', patch as ILogObject);
      expect(result).toBeUndefined();
    });
  });
});
