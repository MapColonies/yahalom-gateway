import jsLogger from '@map-colonies/js-logger';
import { ILogObject, MessageManager } from '@src/message/models/messageManager';
import { getResponseMessage, localMessagesStore } from '../../../../src/common/mocks';
import { IQueryModel } from './../../../../src/common/interfaces';

let messageManager: MessageManager;

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
      localMessagesStore.push(getResponseMessage); // for testing the quary, should be replaced when adding db
    });

    it('should return matching message with all filters', () => {
      const query: IQueryModel = {
        sessionId: 2234234,
        severity: 'ERROR',
        component: 'MAP',
        messageType: 'APPEXITED',
      };

      const messages = messageManager.getMessages(query);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(getResponseMessage);
    });

    it('should return message if filters are empty', () => {
      const messages = messageManager.getMessages({});
      expect(messages).toHaveLength(1);
    });

    it('should return no message if severity does not match', () => {
      const query: IQueryModel = {
        severity: 'WARNING',
      };
      const messages = messageManager.getMessages(query);
      expect(messages).toHaveLength(0);
    });

    it('should return no message if component does not match', () => {
      const query: IQueryModel = {
        component: 'NOT-MAP',
      };
      const messages = messageManager.getMessages(query);
      expect(messages).toHaveLength(0);
    });

    it('should return no message if messageType does not match', () => {
      const query: IQueryModel = {
        messageType: 'UNKNOWN',
      };
      const messages = messageManager.getMessages(query);
      expect(messages).toHaveLength(0);
    });

    it('should return no message if sessionId does not match', () => {
      const query: IQueryModel = {
        sessionId: 999999,
      };
      const messages = messageManager.getMessages(query);
      expect(messages).toHaveLength(0);
    });

    it('should return message if only severity matches', () => {
      const query: IQueryModel = {
        severity: 'ERROR',
      };
      const messages = messageManager.getMessages(query);
      expect(messages).toHaveLength(1);
    });

    it('should return message if only component matches', () => {
      const query: IQueryModel = {
        component: 'MAP',
      };
      const messages = messageManager.getMessages(query);
      expect(messages).toHaveLength(1);
    });

    it('should return message if only messageType matches', () => {
      const query: IQueryModel = {
        messageType: 'APPEXITED',
      };
      const messages = messageManager.getMessages(query);
      expect(messages).toHaveLength(1);
    });

    it('should return message if only sessionId matches', () => {
      const query: IQueryModel = {
        sessionId: 2234234,
      };
      const messages = messageManager.getMessages(query);
      expect(messages).toHaveLength(1);
    });

    it('should return the message with the given Id', () => {
      const message = messageManager.getMessageById(getResponseMessage.id);
      expect(message).toEqual(getResponseMessage);
    });

    it('should return null if no message with the given Id exists for get request', () => {
      const message = messageManager.getMessageById('non-existent-id');
      expect(message).toBeUndefined();
    });

    it('should return the deleted message Id', () => {
      const message = messageManager.deleteMessageById(getResponseMessage.id);
      expect(message).toEqual(getResponseMessage);
    });

    it('should return null if no message with the given Id exists for delete request', () => {
      const message = messageManager.deleteMessageById('non-existent-id');
      expect(message).toBeUndefined();
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

    it('should return undefined if trying to change Id', () => {
      const patch: Partial<ILogObject> = {
        id: 'new-id',
      };

      const result = messageManager.patchMessageById('1', patch as ILogObject);
      expect(result).toBeUndefined();
    });
  });
});
