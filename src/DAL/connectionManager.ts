/* istanbul ignore file */
import config from 'config';
import { DataSource } from 'typeorm';
import httpStatusCodes from 'http-status-codes';
import type { Logger } from '@map-colonies/js-logger';
import { inject, singleton } from 'tsyringe';
import { promiseTimeout } from '@src/utils/promiseTimeout';
import { DB_TIMEOUT, MAX_CONNECT_RETRIES, SERVICES } from '../common/constants';
import { AppError } from '../common/appError';
import { DbConfig, LogContext } from '../common/interfaces';
import { createConnectionOptions } from './createConnectionOptions';

@singleton()
export class ConnectionManager {
  private dataSource: DataSource | null = null;
  private readonly connectionConfig: DbConfig;
  private readonly logContext: LogContext;

  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger) {
    this.connectionConfig = config.get<DbConfig>('db');
    this.logContext = { fileName: __filename, class: ConnectionManager.name };
  }

  public async init(): Promise<void> {
    const logContext = { ...this.logContext, function: this.init.name };

    if (this.dataSource?.isInitialized === true) {
      this.logger.info({ msg: 'Data Source already initialized', logContext });
      return;
    }

    let retries = 0;
    let connectionSuccess = false;
    while (retries < MAX_CONNECT_RETRIES && !connectionSuccess) {
      try {
        this.dataSource = new DataSource(createConnectionOptions(this.connectionConfig));
        await this.dataSource.initialize();
        this.logger.info({ msg: 'Data Source successfully initialized', logContext });
        connectionSuccess = true;
      } catch (error) {
        retries++;
        this.logger.warn({ msg: `DB connection failed, retrying ${retries}/${MAX_CONNECT_RETRIES}`, error, logContext });
        await new Promise((res) => setTimeout(res, DB_TIMEOUT));
      }
    }

    if (!connectionSuccess) {
      this.logger.error({ msg: 'Database connection failed', logContext });
      throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Database connection failed', false);
    }
  }

  public getConnection(): DataSource {
    this.logger.info({ msg: 'Connection details:' });
    const logContext = { ...this.logContext, function: this.getConnection.name };

    if (this.dataSource?.isInitialized !== true) {
      this.logger.error({ msg: 'Data Source not available or lost', logContext });
      throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Database connection not initialized', false);
    }
    return this.dataSource;
  }

  public healthCheck = (): (() => Promise<void>) => {
    const logContext = { ...this.logContext, function: this.healthCheck.name };

    return async (): Promise<void> => {
      if (this.dataSource?.isInitialized !== true) {
        this.logger.error({ msg: 'Health check failed: Data Source not initialized', logContext });
        throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Database connection not initialized', false);
      }

      try {
        const check = this.dataSource.query('SELECT 1').then(() => {});
        await promiseTimeout<void>(DB_TIMEOUT, check);
        this.logger.debug({ msg: 'Database health check passed', logContext });
      } catch (error) {
        this.logger.error({ msg: 'Database health check failed', error, logContext });
        throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Database health check failed', false);
      }
    };
  };

  public shutdown(): () => Promise<void> {
    const logContext = { ...this.logContext, function: this.shutdown.name };

    return async (): Promise<void> => {
      if (this.dataSource?.isInitialized !== true) {
        this.logger.warn({ msg: 'Shutdown skipped: Data Source not initialized', logContext });
        return;
      }

      try {
        this.logger.info({ msg: 'Shutting down Data Source...', logContext });
        await this.dataSource.destroy();
        this.logger.info({ msg: 'Data Source successfully shut down', logContext });
        this.dataSource = null;
      } catch (error) {
        this.logger.error({ msg: 'Failed to shut down Data Source', error, logContext });
        throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to shut down database connection', false);
      }
    };
  }
}
