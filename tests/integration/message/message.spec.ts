import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import httpStatusCodes from 'http-status-codes';
import { createRequestSender, RequestSender } from '@map-colonies/openapi-helpers/requestSender';
import { paths, operations } from '@openapi';
import { getApp } from '@src/app';
import { SERVICES } from '@common/constants';
import { initConfig } from '@src/common/config';
import { getResponseMessage, localMesssagesStore } from '../../../src/common/mocks';
import { MessageManager } from './../../../src/message/models/messageManager';

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
    localMesssagesStore.length = 0; // ensure 'store' list is empty, TODO: change test when connecting db
  });

  describe('Happy Path', function () {
    it('should return 201 status code and the internal id', async function () {
      const response = await requestSender.createMessage({
        requestBody: getResponseMessage,
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.CREATED);
    });

    it('should return 200 status code and appropriate message when no messages match filters', async function () {
      const response = await requestSender.getMessages({
        queryParams: {
          sessionId: 22342,
          severity: 'ERROR',
          component: 'MAP',
          messageType: 'APPEXITED',
        },
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
    });

    it('should return 200 status code and hadnling if no query params provided', async function () {
      const response = await requestSender.getMessages();

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
    });

    it('should return 200 and empty array when query params explicitly set to undefined', async () => {
      const response = await requestSender.getMessages({
        queryParams: undefined,
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    it('should return 200 status code and filtered messages', async function () {
      await requestSender.createMessage({
        requestBody: getResponseMessage,
      });

      const response = await requestSender.getMessages();

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
    });

    it('should return 200 and the correct message for a valid Id', async () => {
      localMesssagesStore.push(getResponseMessage);

      const response = await requestSender.getMessageById({
        pathParams: { id: getResponseMessage.id },
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
    });
  });

  describe('Bad Path', function () {
    it('should return 400 status code for exceeding the time', async function () {
      const response = await requestSender.createMessage({
        requestBody: getResponseMessage,
      });

      expect(Date.now() + 1000).toBeGreaterThan(new Date(getResponseMessage.timeStamp).getTime());
      expect(response.status).not.toBe(httpStatusCodes.BAD_REQUEST);
    });
  });

  describe('Sad Path', function () {
    it('should return 404 when the message Id does not exist', async () => {
      const response = await requestSender.getMessageById({
        pathParams: { id: 'non-existent-id' },
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
      expect(response.body).toEqual({
        message: 'No message found with id non-existent-id',
      });
    });

    it('should return 500 status code when createMessage throws an error', async () => {
      jest.spyOn(MessageManager.prototype, 'createMessage').mockImplementation(() => {
        throw new Error('Simulated error');
      });

      const response = await requestSender.createMessage({ requestBody: getResponseMessage });

      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({ message: 'Failed to create message' });

      jest.restoreAllMocks();
    });

    it('should return 500 status code when getMessages throws an error -  gets params', async function () {
      jest.spyOn(MessageManager.prototype, 'getMessages').mockImplementation(() => {
        throw new Error('Simulated error');
      });

      const response = await requestSender.getMessages({
        queryParams: {
          sessionId: 22342,
          severity: 'ERROR',
          component: 'MAP',
          messageType: 'APPEXITED',
        },
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({ message: 'Failed to get messages' });

      jest.restoreAllMocks();
    });
  });
});
