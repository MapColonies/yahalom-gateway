/* istanbul ignore file */
import config from 'config';
import { DataSource } from 'typeorm';
import httpStatusCodes from 'http-status-codes';
import type { Logger } from '@map-colonies/js-logger';
import { promiseTimeout } from '@src/utils/promiseTimeout';
import { DB_TIMEOUT } from '../common/constants';
import { AppError } from '../common/appError';
import { DbConfig } from '../common/interfaces';
import { createConnectionOptions } from './createConnectionOptions';
import { singleton } from 'tsyringe';

@singleton()
export class ConnectionManager {
  private static instance: ConnectionManager | undefined;
  private dataSource: DataSource | null = null;
  private readonly connectionConfig: DbConfig;
  private readonly logger: Logger;

  private constructor(logger: Logger) {
    this.logger = logger;
    this.connectionConfig = config.get<DbConfig>('db');
  }

  public static getInstance(logger?: Logger): ConnectionManager {
    if (ConnectionManager.instance == null) {
      if (logger == null) {
        throw new Error('Logger must be provided for the first ConnectionManager instance');
      }
      ConnectionManager.instance = new ConnectionManager(logger);
    }
    return ConnectionManager.instance;
  }

  public async initializeConnection(): Promise<void> {
    if (this.dataSource && !this.dataSource.isInitialized) {
      this.logger.info({ msg: 'Data Source already initialized' });
      return;
    }

    try {
      this.logger.info({ msg: 'Initializing Data Source...' });
      this.dataSource = new DataSource(createConnectionOptions(this.connectionConfig));
      await this.dataSource.initialize();
      this.logger.info({ msg: 'Data Source successfully initialized' });
    } catch (error) {
      this.logger.error({ msg: 'Failed to initialize Data Source', error });
      throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to initialize database connection', false);
    }
  }

  public getConnection(): DataSource {
    if (this.dataSource?.isInitialized !== true) {
      this.logger.error({ msg: 'Data Source not available or lost' });
      throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Database connection not initialized', false);
    }
    return this.dataSource;
  }

  public healthCheck = (): (() => Promise<void>) => {
    return async (): Promise<void> => {
      if (this.dataSource?.isInitialized !== true) {
        this.logger.error({ msg: 'Health check failed: Data Source not initialized' });
        throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Database connection not initialized', false);
      }

      try {
        const check = this.dataSource.query('SELECT 1').then(() => {});
        await promiseTimeout<void>(DB_TIMEOUT, check);
        this.logger.debug({ msg: 'Database health check passed' });
      } catch (error) {
        this.logger.error({ msg: 'Database health check failed', error });
        throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Database health check failed', false);
      }
    };
  };

  public shutdown(): () => Promise<void> {
    return async (): Promise<void> => {
      if (this.dataSource?.isInitialized !== true) {
        this.logger.warn({ msg: 'Shutdown skipped: Data Source not initialized' });
        return;
      }

      try {
        this.logger.info({ msg: 'Shutting down Data Source...' });
        await this.dataSource.destroy();
        this.logger.info({ msg: 'Data Source successfully shut down' });
        this.dataSource = null;
      } catch (error) {
        this.logger.error({ msg: 'Failed to shut down Data Source', error });
        throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to shut down database connection', false);
      }
    };
  }
}
