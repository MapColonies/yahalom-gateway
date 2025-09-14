import jsLogger from '@map-colonies/js-logger';
import { MessageManager } from '@src/message/models/messageManager';

let messageManager: MessageManager;

describe('ResourceNameManager', () => {
  beforeEach(function () {
    messageManager = new MessageManager(jsLogger({ enabled: false }));
  });

  describe('#createResource', () => {
    it('return the resource of id 1', function () {
      const message = messageManager.createMessage({
        sessionId: 9876543210,
        severity: 'Error',
        timeStamp: '2025-09-11T13:45:00.000Z',
        message: 'Failed to authenticate user.',
        messageParameters: {
          userId: 'user123',
          iP: '192.168.1.10',
          attempt: '3',
          reason: 'Invalid credentials',
        },
        component: 'AuthService',
        messageType: 'Audit',
      });

      // expectation
      expect(message.sessionId).toBeGreaterThanOrEqual(0);
      expect(message).toHaveProperty('severity', 'Error');
      expect(message).toHaveProperty('message', 'Failed to authenticate user.');
    });
  });
});
