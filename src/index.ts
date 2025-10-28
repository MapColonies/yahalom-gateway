import 'reflect-metadata';
import { createServer } from 'http';
import { createTerminus } from '@godaddy/terminus';
import { Logger } from '@map-colonies/js-logger';
import { SERVICES } from '@common/constants';
import { ConfigType } from '@common/config';
import { getApp } from './app';

void getApp()
  .then(([app, container]) => {
    const logger = container.resolve<Logger>(SERVICES.LOGGER);
    const config = container.resolve<ConfigType>(SERVICES.CONFIG);
    const port = config.get('server.port');

    const healthCheckFn = container.resolve<() => Promise<void>>(SERVICES.HEALTH_CHECK);
    const onSignalFn = container.resolve<() => Promise<void>>('onSignal');

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
