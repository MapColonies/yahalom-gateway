import httpStatusCodes from 'http-status-codes';
import { Repository } from 'typeorm';
import { createRequestSender, RequestSender } from '@map-colonies/openapi-helpers/requestSender';
import { paths, operations } from '@openapi';
import { getApp } from '@src/app';
import { initConfig } from '@src/common/config';
import { AppDataSource } from '@src/DAL/dataSource';
import { Message } from '@src/DAL/entities/message';
import { fullMessageInstance } from '../../mocks/generalMocks';

let requestSender: RequestSender<paths, operations>;

beforeAll(async () => {
  await initConfig(true);

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize().catch((err) => {
      console.error('❌ DB initialization failed:', err);
      throw err;
    });
  }

  console.log('✅ DB connection established.');

  await AppDataSource.getRepository(Message).clear();

  const [app] = await getApp({ useChild: true });
  requestSender = await createRequestSender<paths, operations>('openapi3.yaml', app);
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

beforeEach(async () => {
  await AppDataSource.getRepository(Message).clear();
});

// -------------------- Happy Path --------------------
describe('Message Integration Tests - Happy Path', () => {
  it('should return 201 when creating a message', async () => {
    const response = await requestSender.createMessage({ requestBody: fullMessageInstance });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.CREATED);
  });

  it('should return all messages if no query params', async () => {
    await requestSender.createMessage({ requestBody: fullMessageInstance });

    const response = await requestSender.getMessages();

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.OK);
    expect(response.body).toHaveLength(1);
  });

  it('should return filtered messages', async () => {
    await requestSender.createMessage({ requestBody: fullMessageInstance });

    const response = await requestSender.getMessages({
      queryParams: {
        sessionId: fullMessageInstance.sessionId,
        severity: fullMessageInstance.severity,
        component: fullMessageInstance.component,
        messageType: fullMessageInstance.messageType,
      },
    });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.OK);
    expect(response.body).toHaveLength(1);
  });

  it('should return empty array when no matches', async () => {
    const response = await requestSender.getMessages({ queryParams: { sessionId: 'non-existent' } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.OK);
    expect(response.body).toEqual([]);
  });

  it('should return a message by valid Id', async () => {
    const created = await requestSender.createMessage({ requestBody: fullMessageInstance });
    const { id } = created.body as { id: string };

    const response = await requestSender.getMessageById({ pathParams: { id } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.OK);
  });

  it('should delete a message successfully', async () => {
    const created = await requestSender.createMessage({ requestBody: fullMessageInstance });
    const { id } = created.body as { id: string };

    const response = await requestSender.tryDeleteMessageById({ pathParams: { id } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.OK);
  });

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
  let repo: Repository<Message>;

  beforeEach(() => {
    repo = AppDataSource.getRepository(Message);

    jest.spyOn(repo, 'save').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });
    jest.spyOn(repo, 'find').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });
    jest.spyOn(repo, 'findOneBy').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });
    jest.spyOn(repo, 'delete').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });
    jest.spyOn(repo, 'update').mockImplementation(() => {
      throw new Error('Simulated DB error');
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should return 500 if createMessage throws', async () => {
    const response = await requestSender.createMessage({ requestBody: fullMessageInstance });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to create message' });
  });

  it('should return 500 if getMessages throws', async () => {
    const response = await requestSender.getMessages({
      queryParams: { sessionId: '22342', severity: 'ERROR', component: 'MAP', messageType: 'APPEXITED' },
    });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to get messages' });
  });

  it('should return 500 if getMessageById throws', async () => {
    const created = await requestSender.createMessage({ requestBody: fullMessageInstance });
    const { id } = created.body as { id: string };

    const response = await requestSender.getMessageById({ pathParams: { id } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to get message by id' });
  });

  it('should return 500 if tryDeleteMessageById throws', async () => {
    const created = await requestSender.createMessage({ requestBody: fullMessageInstance });
    const { id } = created.body as { id: string };

    const response = await requestSender.tryDeleteMessageById({ pathParams: { id } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to delete message' });
  });

  it('should return 500 if patchMessageById throws', async () => {
    const created = await requestSender.createMessage({ requestBody: fullMessageInstance });
    const { id } = created.body as { id: string };

    const response = await requestSender.patchMessageById({ pathParams: { id }, requestBody: { severity: 'WARNING' } });

    expect(response).toSatisfyApiSpec();
    expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: 'Failed to patch message' });
  });
});
