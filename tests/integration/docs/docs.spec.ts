import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import httpStatusCodes from 'http-status-codes';
import { getApp } from '@src/app';
import { SERVICES } from '@src/common/constants';
import { initConfig } from '@src/common/config';
import { ConnectionManager } from '@src/DAL/connectionManager';
import { DocsRequestSender } from './helpers/docsRequestSender';

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
};
const mockConnection = { getRepository: jest.fn(() => mockRepository) };

jest.spyOn(ConnectionManager, 'getInstance').mockReturnValue({
  initializeConnection: jest.fn().mockResolvedValue(undefined),
  getConnection: jest.fn(() => mockConnection),
  getRepository: jest.fn(() => mockRepository),
  healthCheck: jest.fn().mockResolvedValue(true),
} as unknown as ConnectionManager);

describe('docs', function () {
  let requestSender: DocsRequestSender;

  beforeAll(async function () {
    await initConfig(true);
  });

  beforeEach(async function () {
    const [app] = await getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
        { token: SERVICES.HEALTH_CHECK, provider: { useValue: async () => true } },
      ],
      useChild: true,
    });
    requestSender = new DocsRequestSender(app);
  });

  describe('Happy Path', function () {
    it('should return 200 status code and the resource', async function () {
      const response = await requestSender.getDocs();
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.type).toBe('text/html');
    });

    it('should return 200 status code and the json spec', async function () {
      const response = await requestSender.getDocsJson();
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.type).toBe('application/json');
      expect(response.body).toHaveProperty('openapi');
    });
  });
});
