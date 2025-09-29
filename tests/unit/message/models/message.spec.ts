import jsLogger from '@map-colonies/js-logger';
import { MessageManager } from '@src/message/models/messageManager';
import { getResponseMessage, localMesssagesStore } from '../../../../src/common/mocks';
import { IQueryModel } from './../../../../src/common/interfaces';

let messageManager: MessageManager;

describe('MessageManager', () => {
  beforeEach(() => {
    messageManager = new MessageManager(jsLogger({ enabled: false }));
    localMesssagesStore.length = 0; // clear the store before each test
  });

  describe('#createMessage', () => {
    it('should return the created message', () => {
      const message = messageManager.createMessage(getResponseMessage);
      expect(message.sessionId).toBe(2234234);
    });
  });

  describe('#getMessages', () => {
    beforeEach(() => {
      localMesssagesStore.push(getResponseMessage); // for testing the quary
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

    it('should return null if no message with the given ID exists', () => {
      const message = messageManager.getMessageById('non-existent-id');
      expect(message).toBeUndefined();
    });
  });
});
