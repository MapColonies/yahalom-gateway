import express, { Router } from 'express';
import bodyParser from 'body-parser';
import compression, { CompressionFilter } from 'compression';
import { OpenapiViewerRouter } from '@map-colonies/openapi-express-viewer';
import { getErrorHandlerMiddleware } from '@map-colonies/error-express-handler';
import { middleware as OpenApiMiddleware } from 'express-openapi-validator';
import { inject, injectable } from 'tsyringe';
import type { Logger } from '@map-colonies/js-logger';
import httpLogger from '@map-colonies/express-access-log-middleware';
import { getTraceContexHeaderMiddleware } from '@map-colonies/telemetry';
import { collectMetricsExpressMiddleware } from '@map-colonies/telemetry/prom-metrics';
import { Registry } from 'prom-client';
import type { ConfigType } from '@common/config';
import { SERVICES } from '@common/constants';
import { MESSAGE_ROUTER_SYMBOL } from './message/routes/messageRouter';

@injectable()
export class ServerBuilder {
  private readonly serverInstance: express.Application;

  public constructor(
    @inject(SERVICES.CONFIG) private readonly config: ConfigType,
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.METRICS) private readonly metricsRegistry: Registry,
    @inject(MESSAGE_ROUTER_SYMBOL) private readonly messageRouter: Router
  ) {
    this.serverInstance = express();
  }

  public build(): express.Application {
    this.registerPreRoutesMiddleware();
    this.buildRoutes();
    this.registerPostRoutesMiddleware();
    return this.serverInstance;
  }

  // Helper: ensures unknown values are objects
  private asObject<T extends object>(value: unknown, defaultValue: T): T {
    return typeof value === 'object' && value !== null ? (value as T) : defaultValue;
  }

  private buildDocsRoutes(): void {
    const openapiConfig = this.asObject(this.config.get('openapiConfig'), {
      filePath: '/openapi3.yaml',
      basePath: '/openapi',
      uiPath: '/docs',
    });

    const openapiRouter = new OpenapiViewerRouter({
      ...openapiConfig,
      filePathOrSpec: openapiConfig.filePath,
      uiPath: openapiConfig.uiPath,
    });

    openapiRouter.setup();
    this.serverInstance.use(openapiConfig.basePath, openapiRouter.getRouter());
  }

  private buildRoutes(): void {
    this.serverInstance.use('/message', this.messageRouter);
    this.buildDocsRoutes();
  }

  private registerPreRoutesMiddleware(): void {
    this.serverInstance.use(collectMetricsExpressMiddleware({ registry: this.metricsRegistry }));
    this.serverInstance.use(httpLogger({ logger: this.logger, ignorePaths: ['/metrics'] }));

    const compressionConfig = this.asObject(this.config.get('server.response.compression'), {
      enabled: false,
      options: undefined as CompressionFilter | undefined,
    });

    if (compressionConfig.enabled) {
      this.serverInstance.use(compression(compressionConfig.options));
    }

    const payloadOptions = this.asObject(this.config.get('server.request.payload'), {});
    this.serverInstance.use(bodyParser.json(payloadOptions));

    this.serverInstance.use(getTraceContexHeaderMiddleware());

    const openapiConfig = this.asObject(this.config.get('openapiConfig'), {
      filePath: '/openapi3.yaml',
      basePath: '/openapi',
      uiPath: '/docs',
    });

    const ignorePathRegex = new RegExp(`^${openapiConfig.basePath}/.*`, 'i');

    this.serverInstance.use(
      OpenApiMiddleware({
        apiSpec: openapiConfig.filePath,
        validateRequests: true,
        ignorePaths: ignorePathRegex,
      })
    );
  }

  private registerPostRoutesMiddleware(): void {
    this.serverInstance.use(getErrorHandlerMiddleware());
  }
}
