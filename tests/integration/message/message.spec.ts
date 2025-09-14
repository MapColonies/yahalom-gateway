import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import httpStatusCodes from 'http-status-codes';
import { createRequestSender, RequestSender } from '@map-colonies/openapi-helpers/requestSender';
import { paths, operations } from '@openapi';
import { getApp } from '@src/app';
import { SERVICES } from '@common/constants';
import { initConfig } from '@src/common/config';
import { messageObjectInstance, payload } from './../../../src/common/payloads';

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
    it('should return 201 status code and create the message', async function () {
      const response = await requestSender.createMessage({
        requestBody: messageObjectInstance,
      });

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.CREATED);
    });
  });

  describe('Bad Path', function () {
    it('should return 400 status code for exceeding the time', async function () {
      //  const response = await requestSender.createMessage({
      //   requestBody: messageObjectInstance
      // });
      // expect(Date.now() + 1000).toBeGreaterThan(response.reques);
      // expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    });

    it('should return 400 status code for not unique sessionId', async function () {
      const firstResponse = await requestSender.createMessage({
        requestBody: messageObjectInstance,
      });
      const secondResponse = await requestSender.createMessage({
        requestBody: messageObjectInstance,
      });

      expect(secondResponse.status).toBe(httpStatusCodes.BAD_REQUEST);
    });
  });

  describe('Sad Path', function () {
    // All requests with status code 4XX-5XX
  });
});
