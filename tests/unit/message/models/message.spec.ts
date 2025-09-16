import jsLogger from '@map-colonies/js-logger';
import { MessageManager } from '@src/message/models/messageManager';
import { messageObjectInstance } from './../../../../src/common/payloads';

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
});
