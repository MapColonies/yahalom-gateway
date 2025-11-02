// Notice: The following file is used only for running loacl migration from CLI
/* istanbul ignore file */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from 'config';
import { DbConfig } from '../common/interfaces';
import { Message } from './entities/message';

const dbConfig = config.get<DbConfig>('db');

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AppDataSource = new DataSource({
  type: dbConfig.type,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [Message],
  migrations: ['./src/DAL/migration/*.ts'],
  synchronize: process.env.NODE_ENV === 'test' ? true : dbConfig.synchronize,
  logging: dbConfig.logging ?? false,
  dropSchema: process.env.NODE_ENV === 'test',
});
