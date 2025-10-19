/* istanbul ignore file */
import config from 'config';
import { DataSource } from 'typeorm';
import { DbConfig } from '@src/common/interfaces';
import { Message } from '@src/DAL/entities/Message';

const dbConfig = config.get<DbConfig>('db');

export const messageLogsDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.name,
  synchronize: false,
  logging: false,
  entities: [Message],
  migrations: ['src/DAL/migration/**/*.ts'],
});
