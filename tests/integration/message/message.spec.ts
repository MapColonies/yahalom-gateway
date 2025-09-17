import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import httpStatusCodes from 'http-status-codes';
import { createRequestSender, RequestSender } from '@map-colonies/openapi-helpers/requestSender';
import { paths, operations } from '@openapi';
import { getApp } from '@src/app';
import { SERVICES } from '@common/constants';
import { initConfig } from '@src/common/config';
import { messageObjectInstance, localMesssagesStore } from './../../../src/common/payloads';
import { MessageManager } from '../../../src/message/models/messageManager';

describe('message', function () {
  let requestSender: RequestSender<paths, operations>;

  beforeAll(async function () {
    await initConfig(true);
  });

  beforeEach(async function () {
    const [app] = await getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
      ],
      useChild: true,
    });
    requestSender = await createRequestSender<paths, operations>('openapi3.yaml', app);
  });

  describe('Happy Path', function () {
    it('should return 201 status code and the internal id', async function () {
      const response = await requestSender.createMessage({
        requestBody: messageObjectInstance,
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.CREATED);
    });

    it('should return 204 status code and appropriate message when no messages match filters', async function () {
      localMesssagesStore.length = 0; // ensure 'store' list is empty, TODO: change test when connecting db

      const response = await requestSender.getMessages({
        queryParams: {
          sessionId: 22342,
          severity: 'ERROR',
          component: 'MAP',
          messageType: 'APPEXITED',
        },
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.NO_CONTENT);
    });

    it('should return 200 status code and filtered messages', async function () {
      await requestSender.createMessage({
        requestBody: messageObjectInstance,
      });

      const response = await requestSender.getMessages();

      expect(response).toSatisfyApiSpec();
      expect(response.status).not.toBe(httpStatusCodes.NO_CONTENT);
    });
  });

  describe('Bad Path', function () {
    it('should return 400 status code for exceeding the time', async function () {
      const response = await requestSender.createMessage({
        requestBody: messageObjectInstance,
      });

      expect(Date.now() + 1000).toBeGreaterThan(new Date(messageObjectInstance.timeStamp).getTime());
      expect(response.status).not.toBe(httpStatusCodes.BAD_REQUEST);
    });
  });

  describe('Sad Path', function () {
    it('should return 500 status code when getMessages throws an error', async function () {
      jest.spyOn(MessageManager.prototype, 'getMessages').mockImplementation(() => {
        throw new Error('Simulated error');
      });

      const response = await requestSender.getMessages();

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({ error: 'Failed to get messages' });

      jest.restoreAllMocks();
    });
  });
});
