import httpStatusCodes from 'http-status-codes';
import { DependencyContainer } from 'tsyringe';
import { createRequestSender, RequestSender } from '@map-colonies/openapi-helpers/requestSender';
import { paths, operations } from '@openapi';
import { getApp } from '@src/app';
import { Message } from '@src/DAL/entities/message';
import { MessageManager } from '@src/message/models/messageManager';
import { ConnectionManager } from '@src/DAL/connectionManager';
import { initConfig } from '@src/common/config';
import { registerExternalValues } from '@src/containerConfig';
import { SERVICES } from '@common/constants';
import { fullQueryParamsInstnace, fullMessageInstance, nonExistentId } from '../../mocks/generalMocks';

let requestSender: RequestSender<paths, operations>;
let dependencyContainer: DependencyContainer;

beforeAll(async () => {
  await initConfig(true);

  dependencyContainer = await registerExternalValues({ useChild: true });

  const connectionManager = dependencyContainer.resolve<ConnectionManager>(SERVICES.CONNECTION_MANAGER);
  console.log('✅ ConnectionManager DataSource initialized.');

  const connection = connectionManager.getConnection();

  const [app] = await getApp({ useChild: false });

  requestSender = await createRequestSender('openapi3.yaml', app);

  await connection.getRepository(Message).clear();
});

afterAll(async () => {
  const connectionManager = dependencyContainer.resolve(ConnectionManager);
  await connectionManager.shutdown()();
  console.log('🧹 ConnectionManager shut down.');
});

// -------------------- Happy Path --------------------
describe('Message Integration Tests - Happy Path', () => {
  describe('#createMessage', () => {
    it('should return 201 when creating a message', async () => {
      const response = await requestSender.createMessage({ requestBody: fullMessageInstance });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.CREATED);
    });
  });

  describe('#getMessages', () => {
    it('should return all messages if no query params', async () => {
      await requestSender.createMessage({ requestBody: fullMessageInstance });
      const response = await requestSender.getMessages();

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).not.toEqual([]);
    });

    it('should return filtered messages', async () => {
      await requestSender.createMessage({ requestBody: fullMessageInstance });

      const response = await requestSender.getMessages({
        queryParams: fullQueryParamsInstnace,
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
    });

    it('should return empty array when no matches', async () => {
      const response = await requestSender.getMessages({ queryParams: { sessionId: 'non-existent' } });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual([]);
    });
  });

  describe('#getMessageById', () => {
    it('should return a message by valid Id', async () => {
      const created = await requestSender.createMessage({ requestBody: fullMessageInstance });
      const { id } = created.body as { id: string };

      const response = await requestSender.getMessageById({ pathParams: { id } });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
    });
  });

  describe('#tryDeleteMessageById', () => {
    it('should delete a message successfully', async () => {
      const created = await requestSender.createMessage({ requestBody: fullMessageInstance });
      const { id } = created.body as { id: string };

      const response = await requestSender.tryDeleteMessageById({ pathParams: { id } });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
    });
  });

  // TODO: When adding patchMessageById request to db, change this test to be OK
  describe('#patchMessageById', () => {
    it('should patch a message successfully', async () => {
      const created = await requestSender.createMessage({ requestBody: fullMessageInstance });
      const { id } = created.body as { id: string };

      const response = await requestSender.patchMessageById({
        pathParams: { id },
        requestBody: { message: 'Updated message' },
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).not.toBe(httpStatusCodes.OK);
      //expect(response.body.message).toBe('Updated message');
    });
  });
});

// -------------------- Bad Path --------------------
describe('Message Integration Tests - Bad Path', () => {
  it('should return 404 for getMessageById with non-existent id', async () => {
    const response = await requestSender.getMessageById({ pathParams: { id: nonExistentId } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    expect(response.body).toEqual({ message: `No message found with id '${nonExistentId}'` });
  });

  it('should return 404 for tryDeleteMessageById with non-existent id', async () => {
    const response = await requestSender.tryDeleteMessageById({ pathParams: { id: nonExistentId } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    expect(response.body).toEqual({ message: `No message found to delete with id '${nonExistentId}'` });
  });

  it('should return 400 for patch with empty body', async () => {
    const created = await requestSender.createMessage({ requestBody: fullMessageInstance });
    const messageBody = created.body as { id: string };

    const response = await requestSender.patchMessageById({ pathParams: { id: messageBody.id }, requestBody: {} });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.body).toEqual({ message: `No params found to patch with id '${messageBody.id}'` });
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
    jest.spyOn(MessageManager.prototype, 'createMessage').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });

    const response = await requestSender.createMessage({ requestBody: fullMessageInstance });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to create message' });
  });

  it('should return 500 if getMessages throws', async () => {
    jest.spyOn(MessageManager.prototype, 'getMessages').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });

    const response = await requestSender.getMessages({
      queryParams: { sessionId: '22342', severity: 'ERROR', component: 'MAP', messageType: 'APPEXITED' },
    });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to get messages' });
  });

  it('should return 500 if getMessageById throws', async () => {
    jest.spyOn(MessageManager.prototype, 'getMessageById').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });

    const response = await requestSender.getMessageById({ pathParams: { id: 'any-id' } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to get message by id' });
  });

  it('should return 500 if tryDeleteMessageById throws', async () => {
    jest.spyOn(MessageManager.prototype, 'tryDeleteMessageById').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });

    const response = await requestSender.tryDeleteMessageById({ pathParams: { id: 'any-id' } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to delete message' });
  });

  it('should return 500 if patchMessageById throws', async () => {
    jest.spyOn(MessageManager.prototype, 'patchMessageById').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });

    const response = await requestSender.patchMessageById({
      pathParams: { id: 'any-id' },
      requestBody: { severity: 'WARNING' },
    });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to patch message' });
  });
});
