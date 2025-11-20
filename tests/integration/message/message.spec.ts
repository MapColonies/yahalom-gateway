import httpStatusCodes from 'http-status-codes';
import { DependencyContainer } from 'tsyringe';
import { createRequestSender, RequestSender } from '@map-colonies/openapi-helpers/requestSender';
import { DeepPartial } from 'typeorm';
import { paths, operations } from '@openapi';
import { getApp } from '@src/app';
import { Message } from '@src/DAL/entities/message';
import { MessageManager } from '@src/message/models/messageManager';
import { ConnectionManager } from '@src/DAL/connectionManager';
import { initConfig } from '@src/common/config';
import { registerExternalValues } from '@src/containerConfig';
import { SERVICES } from '@src/common/constants';
import {
  NON_EXISTENT_INVALID_ID,
  fullQueryParamsInstnace,
  fullMessageInstance,
  NON_EXISTENT_VALID_ID,
  invalidMessageInstance,
  INVALID_UUID,
} from '@tests/mocks/generalMocks';

let requestSender: RequestSender<paths, operations>;
let dependencyContainer: DependencyContainer;

beforeAll(async () => {
  await initConfig(true);

  dependencyContainer = await registerExternalValues({ useChild: true });

  console.log('✅ ConnectionManager DataSource initialized.');

  const [app] = await getApp({ useChild: false });

  requestSender = await createRequestSender('openapi3.yaml', app);
});

beforeEach(async () => {
  const connectionManager = dependencyContainer.resolve<ConnectionManager>(SERVICES.CONNECTION_MANAGER);
  const connection = connectionManager.getConnection();
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
      const emptyResponse = await requestSender.getMessages({
        queryParams: fullQueryParamsInstnace,
      });

      expect(emptyResponse).toSatisfyApiSpec();
      expect(emptyResponse.status).toBe(httpStatusCodes.OK);
      expect(emptyResponse.body).toEqual([]);

      await requestSender.createMessage({ requestBody: fullMessageInstance });

      const bodyResponse = await requestSender.getMessages({
        queryParams: fullQueryParamsInstnace,
      });

      expect(bodyResponse).toSatisfyApiSpec();
      expect(bodyResponse.status).toBe(httpStatusCodes.OK);
      const messages = bodyResponse.body as DeepPartial<Message[]>;

      expect(messages).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect(messages[0]).toMatchObject({ ...fullMessageInstance, id: expect.any(String), timeStamp: expect.any(String) });
    });

    it('should return empty array when no matches', async () => {
      const response = await requestSender.getMessages({ queryParams: { sessionId: 'non-existent' } });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual([]);
    });
  });

  describe('#getMessageById', () => {
    it('should return the same message that was created', async () => {
      const createResponse = await requestSender.createMessage({ requestBody: fullMessageInstance });

      const createdMessage = createResponse.body as { id: string };

      const getResponse = await requestSender.getMessageById({ pathParams: { id: createdMessage.id } });

      expect(getResponse).toSatisfyApiSpec();
      expect(getResponse.status).toBe(httpStatusCodes.OK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect(getResponse.body).toMatchObject({ ...fullMessageInstance, id: createdMessage.id, timeStamp: expect.any(String) });
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

  describe('#patchMessageById', () => {
    it('should patch a message successfully', async () => {
      const created = await requestSender.createMessage({ requestBody: fullMessageInstance });
      const { id } = created.body as { id: string };

      const response = await requestSender.patchMessageById({
        pathParams: { id },
        requestBody: { message: 'Updated message' },
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body.message).toBe('Updated message');
    });
  });
});

// -------------------- Bad Path --------------------
describe('Message Integration Tests - Bad Path', () => {
  it('should return 404 for getMessageById with non-existent id', async () => {
    const response = await requestSender.getMessageById({ pathParams: { id: NON_EXISTENT_VALID_ID } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    expect(response.body).toEqual({ message: `No message found with id '${NON_EXISTENT_VALID_ID}'` });
  });

  it('should return 404 for tryDeleteMessageById with non-existent id', async () => {
    const response = await requestSender.tryDeleteMessageById({ pathParams: { id: NON_EXISTENT_VALID_ID } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    expect(response.body).toEqual({ message: `No message found to delete with id '${NON_EXISTENT_VALID_ID}'` });
  });

  it('should return 400 for patch with empty body', async () => {
    const created = await requestSender.createMessage({ requestBody: fullMessageInstance });
    const messageBody = created.body as { id: string };

    const response = await requestSender.patchMessageById({ pathParams: { id: messageBody.id }, requestBody: {} });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.body).toEqual({ message: `No params found to update with id '${messageBody.id}'` });
  });

  it('should return 404 for patch with non-existent id', async () => {
    await requestSender.createMessage({ requestBody: fullMessageInstance });

    const response = await requestSender.patchMessageById({ pathParams: { id: NON_EXISTENT_VALID_ID }, requestBody: { severity: 'WARNING' } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    expect(response.body).toEqual({ message: `No message found with id '${NON_EXISTENT_VALID_ID}'` });
  });

  describe('Message Integration Tests - Validation Errors', () => {
    afterEach(() => jest.restoreAllMocks());

    it('should return 400 for createMessage with invalid params', async () => {
      const response = await requestSender.createMessage({
        requestBody: invalidMessageInstance,
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.body).toEqual({ message: 'Validation error creating message' });
    });

    it('should return 400 for getMessageById with invalid UUID', async () => {
      const response = await requestSender.getMessageById({
        pathParams: { id: INVALID_UUID },
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.body).toEqual({ message: 'Validation error getting message by id' });
    });

    it('should return 400 for patchMessageById with invalid UUID', async () => {
      const response = await requestSender.patchMessageById({
        pathParams: { id: INVALID_UUID },
        requestBody: fullMessageInstance,
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.body).toEqual({ message: 'Validation error updating message by id' });
    });

    it('should return 400 for patchMessageById with invalid body params', async () => {
      const response = await requestSender.patchMessageById({
        pathParams: { id: NON_EXISTENT_INVALID_ID },
        requestBody: invalidMessageInstance,
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.body).toEqual({ message: 'Validation error updating message by id' });
    });

    it('should return 400 for deleteMessageById with invalid UUID', async () => {
      const response = await requestSender.tryDeleteMessageById({
        pathParams: { id: INVALID_UUID },
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.body).toEqual({ message: 'Validation error deleting message by id' });
    });
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
      queryParams: { ...fullQueryParamsInstnace },
    });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to get messages' });
  });

  it('should return 500 if getMessageById throws', async () => {
    jest.spyOn(MessageManager.prototype, 'getMessageById').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });

    const response = await requestSender.getMessageById({ pathParams: { id: NON_EXISTENT_VALID_ID } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to get message by id' });
  });

  it('should return 500 if tryDeleteMessageById throws', async () => {
    jest.spyOn(MessageManager.prototype, 'tryDeleteMessageById').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });

    const response = await requestSender.tryDeleteMessageById({ pathParams: { id: NON_EXISTENT_VALID_ID } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to delete message' });
  });

  it('should return 500 if patchMessageById throws', async () => {
    jest.spyOn(MessageManager.prototype, 'patchMessageById').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });

    const response = await requestSender.patchMessageById({
      pathParams: { id: NON_EXISTENT_VALID_ID },
      requestBody: { severity: 'WARNING' },
    });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to update message' });
  });
});
