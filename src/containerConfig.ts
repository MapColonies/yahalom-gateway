import { getOtelMixin } from '@map-colonies/telemetry';
import { trace } from '@opentelemetry/api';
import { Registry } from 'prom-client';
import { DependencyContainer } from 'tsyringe/dist/typings/types';
import { Repository } from 'typeorm';
import jsLogger from '@map-colonies/js-logger';
import { InjectionObject, registerDependencies } from '@common/dependencyRegistration';
import { SERVICES, SERVICE_NAME } from '@common/constants';
import { getTracing } from '@common/tracing';
import { messageRouterFactory, MESSAGE_ROUTER_SYMBOL } from './message/routes/messageRouter';
import { ConnectionManager } from './DAL/connectionManager';
import { getConfig } from './common/config';
import { Message } from './DAL/entities/message';

export interface RegisterOptions {
  override?: InjectionObject<unknown>[];
  useChild?: boolean;
}

export const registerExternalValues = async (options?: RegisterOptions): Promise<DependencyContainer> => {
  const configInstance = getConfig();

  const loggerConfig = configInstance.get('telemetry.logger');

  const logger = jsLogger({ ...loggerConfig, prettyPrint: loggerConfig.prettyPrint, mixin: getOtelMixin() });

  const tracer = trace.getTracer(SERVICE_NAME);
  const metricsRegistry = new Registry();
  configInstance.initializeMetrics(metricsRegistry);

  const dependencies: InjectionObject<unknown>[] = [
    { token: SERVICES.CONFIG, provider: { useValue: configInstance } },
    { token: SERVICES.LOGGER, provider: { useValue: logger } },
    { token: SERVICES.TRACER, provider: { useValue: tracer } },
    { token: SERVICES.METRICS, provider: { useValue: metricsRegistry } },
    { token: MESSAGE_ROUTER_SYMBOL, provider: { useFactory: messageRouterFactory } },
    {
      token: SERVICES.HEALTH_CHECK,
      provider: {
        useFactory: (dependencyContainer: DependencyContainer): (() => Promise<void>) => {
          const connectionManager = dependencyContainer.resolve(ConnectionManager);
          return async () => {
            await Promise.resolve(connectionManager.healthCheck());
          };
        },
      },
    },
    {
      token: SERVICES.CONNECTION_MANAGER,
      provider: {
        useFactory: async (dependencyContainer: DependencyContainer): Promise<ConnectionManager> => {
          const connectionManager = dependencyContainer.resolve(ConnectionManager);
          await connectionManager.init();
          return connectionManager;
        },
      },
    },
    {
      token: SERVICES.MESSAGE_REPOSITORY,
      provider: {
        useFactory: (container: DependencyContainer): Repository<Message> => {
          const connectionManager = container.resolve(ConnectionManager);
          const connection = connectionManager.getConnection();
          return connection.getRepository(Message);
        },
      },
    },
    {
      token: 'onSignal',
      provider: {
        useFactory: (dependencyContainer: DependencyContainer): (() => Promise<void>) => {
          const connectionManager = dependencyContainer.resolve(ConnectionManager);
          return async () => {
            await Promise.all([Promise.resolve(getTracing().stop()), Promise.resolve(connectionManager.shutdown())]);
          };
        },
      },
    },
  ];

  return Promise.resolve(registerDependencies(dependencies, options?.override, options?.useChild));
};
