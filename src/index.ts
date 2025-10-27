import 'reflect-metadata';
import { createServer } from 'http';
import { createTerminus } from '@godaddy/terminus';
import { Logger } from '@map-colonies/js-logger';
import { SERVICES } from '@common/constants';
import { ConfigType } from '@common/config';
import { getApp } from './app';
import { ConnectionManager } from './DAL/connectionManager';

void getApp()
  .then(async ([app, container]) => {
    const logger = container.resolve<Logger>(SERVICES.LOGGER);
    const config = container.resolve<ConfigType>(SERVICES.CONFIG);
    const port = config.get('server.port');

    const database = ConnectionManager.getInstance();
    await database.init();

    const healthCheckFn = database.healthCheck();
    const onSignalFn: () => Promise<void> = container.resolve<{ useValue: () => Promise<void> }>('onSignal').useValue;

    const server = createTerminus(createServer(app), {
      healthChecks: { '/liveness': healthCheckFn },
      onSignal: onSignalFn,
    });

    server.listen(port, () => {
      logger.info(`app started on port ${port}`);
    });
  })
  .catch((error: Error) => {
    console.error('😢 - failed initializing the server');
    console.error(error);
    process.exit(1);
  });
