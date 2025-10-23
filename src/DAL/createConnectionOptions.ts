/* istanbul ignore file */
import { readFileSync } from 'fs';
import { DataSourceOptions } from 'typeorm';
import { DbConfig } from '../common/interfaces';
import { Message } from './entities/message';

export const createConnectionOptions = (dbConfig: DbConfig): DataSourceOptions => {
  const ENTITIES_DIRS = [Message, 'src/DAL/entities/*.ts'];
  const { enableSslAuth, sslPaths, ...connectionOptions } = dbConfig;

  const baseOptions: DataSourceOptions = { ...connectionOptions, entities: ENTITIES_DIRS };

  if (enableSslAuth === true && sslPaths) {
    return {
      ...baseOptions,
      password: undefined,
      ssl: {
        key: readFileSync(sslPaths.key),
        cert: readFileSync(sslPaths.cert),
        ca: readFileSync(sslPaths.ca),
        rejectUnauthorized: true,
      },
    };
  }

  return baseOptions;
};
