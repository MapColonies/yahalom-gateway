import jsLogger from '@map-colonies/js-logger';
import { MessageManager } from '@src/message/models/messageManager';
import { messageObjectInstance, localMesssagesStore } from './../../../../src/common/payloads';
import { IMessageFilterParams } from './../../../../src/common/interfaces';

let messageManager: MessageManager;

describe('ResourceNameManager', () => {
  beforeEach(function () {
    messageManager = new MessageManager(jsLogger({ enabled: false }));
  });

  describe('#createResource', () => {
    it('return the resource of id 1', function () {
      const message = messageManager.createMessage(messageObjectInstance);

      expect(message).toEqual(messageObjectInstance);
    });
  });

  describe('#getResource', () => {
    const testQuery = {
      sessionId: 2234234,
      severity: 'ERROR',
      component: 'MAP',
      messageType: 'APPEXITED',
    };

    // this test only suitable for a local list store
    it('return the resource of id 1', function () {
      let messages: IMessageFilterParams[] = messageManager.getMessages(testQuery);

      expect(messages).toHaveLength(0);

      localMesssagesStore.push(messageObjectInstance);
      messages = messageManager.getMessages(testQuery);

      expect(messages).toHaveLength(1);
    });
  });
});
