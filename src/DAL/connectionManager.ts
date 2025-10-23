/* istanbul ignore file */
import config from 'config';
import { DataSource } from 'typeorm';
import { singleton } from 'tsyringe';
import httpStatusCodes from 'http-status-codes';
import { promiseTimeout } from '@src/utils/promiseTimeout';
import { DB_TIMEOUT } from '../common/constants';
import { AppError } from '../common/appError';
import { DbConfig } from '../common/interfaces';
import { createConnectionOptions } from './createConnectionOptions';

@singleton()
export class ConnectionManager {
  private static instance: ConnectionManager | null = null;
  private dataSource: DataSource | null = null;
  private readonly connectionConfig: DbConfig;

  public constructor() {
    this.connectionConfig = config.get<DbConfig>('db');
  }

  public static getInstance(): ConnectionManager {
    ConnectionManager.instance ??= new ConnectionManager();
    return ConnectionManager.instance;
  }

  public async initializeConnection(): Promise<void> {
    if (!this.dataSource) {
      this.dataSource = new DataSource(createConnectionOptions(this.connectionConfig));
      await this.dataSource.initialize();
    }
  }

  public getConnection(): DataSource {
    if (!this.dataSource) {
      throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Problem with connection to DB', false);
    }
    return this.dataSource;
  }

  public healthCheck = (): (() => Promise<void>) => {
    return async (): Promise<void> => {
      if (!this.dataSource) {
        throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Problem with connection to DB', false);
      }

      const check = this.dataSource.query('SELECT 1').then(() => {});
      return promiseTimeout<void>(DB_TIMEOUT, check);
    };
  };

  public shutdown(): () => Promise<void> {
    return async (): Promise<void> => {
      if (!this.dataSource) {
        throw new AppError('DB', httpStatusCodes.INTERNAL_SERVER_ERROR, 'Problem with connection to DB', false);
      }
      await this.dataSource.destroy();
    };
  }
}
