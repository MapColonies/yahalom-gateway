import 'reflect-metadata';
import jsLogger from '@map-colonies/js-logger';
import { mockAndWhere, mockGetMany, mockFind, mockRepository, mockConnectionManager } from '@tests/mocks/unitMocks';
import { Message } from '@src/DAL/entities/message';
import { localMessagesStore } from '@src/common/localMocks';
import { ILogObject } from '@src/common/interfaces';
import { MessageManager } from '@src/message/models/messageManager';
import { QUERY_BUILDER_NAME } from '@src/common/constants';
import { fullMessageInstance, fullQueryParamsInstnace } from '../../../mocks/generalMocks';

let messageManager: MessageManager;

describe('MessageManager', () => {
  beforeEach(() => {
    messageManager = new MessageManager(jsLogger({ enabled: false }), mockConnectionManager);
    localMessagesStore.length = 0;

    jest.clearAllMocks();
    mockFind.mockReset();
    mockGetMany.mockReset();
    mockAndWhere.mockReset();
  });

  describe('#createMessage', () => {
    it('should return the created message', () => {
      const message = messageManager.createMessage(fullMessageInstance);
      expect(message.sessionId).toBe('2234234');
      expect(localMessagesStore).toContain(message);
    });
  });

  describe('#getMessages', () => {
    it('should return all messages if params is empty', async () => {
      mockFind.mockResolvedValue([fullMessageInstance as unknown as Message]);
      const result = await messageManager.getMessages({});
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('message', 'some message');
      expect(mockFind).toHaveBeenCalled();
    });

    it('should return filtered messages', async () => {
      mockGetMany.mockResolvedValue([fullMessageInstance as unknown as Message]);
      const result = await messageManager.getMessages(fullQueryParamsInstnace);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('log');
      expect(mockAndWhere).toHaveBeenCalledTimes(4);
      expect(mockGetMany).toHaveBeenCalled();
      expect(result[0]).toHaveProperty('message', 'some message');
    });

    it('should return empty array if no matches', async () => {
      mockGetMany.mockResolvedValue([]);
      const result = await messageManager.getMessages({ sessionId: '999' });
      expect(result).toEqual([]);
    });
  });

  describe('#getMessageById', () => {
    it('should return the message by id', async () => {
      mockRepository.findOne = jest.fn().mockResolvedValue(fullMessageInstance as unknown as Message);
      const result = await messageManager.getMessageById(fullMessageInstance.id);
      const spy = jest.spyOn(mockConnectionManager, 'getConnection');

      expect(spy).toHaveBeenCalled();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: fullMessageInstance.id } });
      expect(result).toEqual(expect.objectContaining({ id: fullMessageInstance.id }));
    });

    it('should return undefined if id does not exist', async () => {
      mockRepository.findOne = jest.fn().mockResolvedValue(null);
      const result = await messageManager.getMessageById('non-existent-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBeUndefined();
    });
  });

  describe('#tryDeleteMessageById', () => {
    it('should return true when message is deleted', () => {
      localMessagesStore.push(fullMessageInstance);
      const result = messageManager.tryDeleteMessageById(fullMessageInstance.id);
      expect(result).toBeTruthy();
      expect(localMessagesStore).toHaveLength(0);
    });

    it('should return false when message does not exist', () => {
      const result = messageManager.tryDeleteMessageById('non-existent-id');
      expect(result).toBeFalsy();
    });
  });

  describe('#patchMessageById', () => {
    it('should update an existing message', () => {
      localMessagesStore.push(fullMessageInstance);
      const patch: Partial<ILogObject> = { message: 'updated' };
      const result = messageManager.patchMessageById(fullMessageInstance.id, patch as ILogObject);
      expect(result).toHaveProperty('message', 'updated');
    });

    it('should return undefined if message does not exist', () => {
      const patch: Partial<ILogObject> = { message: 'nope' };
      const result = messageManager.patchMessageById('non-existent-id', patch as ILogObject);
      expect(result).toBeUndefined();
    });
  });

  describe('private #andWhere', () => {
    it('should add conditions to query builder only if value is not null', async () => {
      mockGetMany.mockResolvedValue([fullMessageInstance as unknown as Message]);

      await messageManager.getMessages(fullQueryParamsInstnace);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(QUERY_BUILDER_NAME);
      expect(mockAndWhere).toHaveBeenCalledTimes(Object.keys(fullQueryParamsInstnace).length);
      expect(mockAndWhere).toHaveBeenCalledWith('log.severity = :severity', { severity: 'ERROR' });

      expect(mockGetMany).toHaveBeenCalled();
    });
  });

  describe('MessageManager DB error handling', () => {
    it('should throw an error if getting DB connection fails when calling getMessages', async () => {
      const failingConnectionManager = {
        getConnection: jest.fn(() => {
          throw new Error('DB not available');
        }),
      } as unknown as typeof mockConnectionManager;

      const manager = new MessageManager(jsLogger({ enabled: false }), failingConnectionManager);
      await expect(manager.getMessages({})).rejects.toThrow('Cannot get repository because the DB connection is unavailable');
    });

    it('should throw an error if the repository action fails when calling getMessageById', async () => {
      const manager = new MessageManager(jsLogger({ enabled: false }), mockConnectionManager);

      mockRepository.findOne = jest.fn(() => {
        throw new Error('Action failed');
      });

      await expect(manager.getMessageById('any-id')).rejects.toThrow('Action failed');
    });
  });
});
