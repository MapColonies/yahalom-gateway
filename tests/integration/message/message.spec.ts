import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import httpStatusCodes from 'http-status-codes';
import { createRequestSender, RequestSender } from '@map-colonies/openapi-helpers/requestSender';
import { Registry } from 'prom-client';
import { paths, operations } from '@openapi';
import { getApp } from '@src/app';
import { SERVICES } from '@common/constants';
import { initConfig } from '@src/common/config';
import { localMessagesStore } from '@src/common/localMocks';
import { ConnectionManager } from '@src/DAL/connectionManager';
import { MessageManager } from '@src/message/models/messageManager';
import { mockRepository, mockConnection } from '@tests/mocks/integrationMocks';
import { fullMessageInstance } from '../../mocks/generalMocks';

jest.spyOn(ConnectionManager, 'getInstance').mockReturnValue({
  initializeConnection: jest.fn().mockResolvedValue(undefined),
  getConnection: jest.fn(() => mockConnection),
  getRepository: jest.fn(() => mockRepository),
  healthCheck: jest.fn().mockResolvedValue(true),
} as unknown as ConnectionManager);

let requestSender: RequestSender<paths, operations>;
const metricsRegistry = new Registry();

beforeAll(async () => {
  await initConfig(true);

  const [app] = await getApp({
    override: [
      { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
      { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
      { token: SERVICES.METRICS, provider: { useValue: metricsRegistry } },
      { token: SERVICES.HEALTH_CHECK, provider: { useValue: true } },
    ],
    useChild: true,
  });

  requestSender = await createRequestSender<paths, operations>('openapi3.yaml', app);
});

beforeEach(() => {
  localMessagesStore.length = 0;
  jest.clearAllMocks();
});

// -------------------- Happy Path --------------------
describe('Message Integration Tests - Happy Path', () => {
  it('should return 201 when creating a message', async () => {
    const response = await requestSender.createMessage({ requestBody: fullMessageInstance });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.CREATED);
  });

  it('should return all messages if no query params', async () => {
    const response = await requestSender.getMessages();

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.OK);
    expect(response.body).toHaveLength(1);
  });

  it('should return filtered messages', async () => {
    const response = await requestSender.getMessages({
      queryParams: {
        sessionId: '2234234',
        severity: 'ERROR',
        component: 'MAP',
        messageType: 'APPEXITED',
      },
    });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.OK);
    expect(response.body).toHaveLength(1);
  });

  it('should return empty array when no matches', async () => {
    (mockRepository.createQueryBuilder as jest.Mock).mockReturnValueOnce({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    });
    const response = await requestSender.getMessages({ queryParams: { sessionId: 'non-existent' } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.OK);
    expect(response.body).toEqual([]);
  });

  it('should return a message by valid Id', async () => {
    localMessagesStore.push(fullMessageInstance);
    const response = await requestSender.getMessageById({ pathParams: { id: fullMessageInstance.id } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.OK);
  });

  it('should delete a message successfully', async () => {
    localMessagesStore.push(fullMessageInstance);
    const response = await requestSender.tryDeleteMessageById({ pathParams: { id: fullMessageInstance.id } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.OK);
  });

  it('should patch a message successfully', async () => {
    localMessagesStore.push(fullMessageInstance);
    const response = await requestSender.patchMessageById({
      pathParams: { id: fullMessageInstance.id },
      requestBody: { message: 'Updated message' },
    });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.OK);
    expect(response.body.message).toBe('Updated message');
  });
});

// -------------------- Bad Path --------------------
describe('Message Integration Tests - Bad Path', () => {
  it('should return 404 for getMessageById with non-existent id', async () => {
    const response = await requestSender.getMessageById({ pathParams: { id: 'non-existent-id' } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    expect(response.body).toEqual({ message: "No message found with id 'non-existent-id'" });
  });

  it('should return 404 for tryDeleteMessageById with non-existent id', async () => {
    const response = await requestSender.tryDeleteMessageById({ pathParams: { id: 'non-existent-id' } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    expect(response.body).toEqual({ message: "No message found to delete with id 'non-existent-id'" });
  });

  it('should return 400 for patch with empty body', async () => {
    localMessagesStore.push(fullMessageInstance);
    const response = await requestSender.patchMessageById({ pathParams: { id: fullMessageInstance.id }, requestBody: {} });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.body).toEqual({ message: `No params found to patch with id '${fullMessageInstance.id}'` });
  });

  it('should return 404 for patch with non-existent id', async () => {
    const response = await requestSender.patchMessageById({ pathParams: { id: 'non-existent-id' }, requestBody: { severity: 'WARNING' } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    expect(response.body).toEqual({ message: "No message found with id 'non-existent-id'" });
  });
});

// -------------------- Sad Path --------------------
describe('Message Integration Tests - Sad Path', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should return 500 if createMessage throws', async () => {
    forceMockInternalServerError('createMessage');
    const response = await requestSender.createMessage({ requestBody: fullMessageInstance });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to create message' });
  });

  it('should return 500 if getMessages throws', async () => {
    forceMockInternalServerError('getMessages');
    const response = await requestSender.getMessages({
      queryParams: { sessionId: '22342', severity: 'ERROR', component: 'MAP', messageType: 'APPEXITED' },
    });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to get messages' });
  });

  it('should return 500 if getMessageById throws', async () => {
    forceMockInternalServerError('getMessageById');
    const response = await requestSender.getMessageById({ pathParams: { id: fullMessageInstance.id } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to get message by id' });
  });

  it('should return 500 if tryDeleteMessageById throws', async () => {
    forceMockInternalServerError('tryDeleteMessageById');
    const response = await requestSender.tryDeleteMessageById({ pathParams: { id: fullMessageInstance.id } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to delete message' });
  });

  it('should return 500 if patchMessageById throws', async () => {
    forceMockInternalServerError('patchMessageById');
    const response = await requestSender.patchMessageById({ pathParams: { id: fullMessageInstance.id }, requestBody: { severity: 'WARNING' } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to patch message' });
  });
});

const forceMockInternalServerError = (methodName: string): void => {
  jest.spyOn(MessageManager.prototype, methodName as never).mockImplementation(() => {
    throw new Error('Simulated error');
  });
};
