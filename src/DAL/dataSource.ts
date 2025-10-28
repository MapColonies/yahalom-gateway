/* istanbul ignore file */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from 'config';
import { DbConfig } from '../common/interfaces';
import { Message } from './entities/message';

const dbConfig = config.get<DbConfig>('db');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [Message],
  migrations: ['./src/DAL/migrations/*.ts'],
  synchronize: dbConfig.synchronize ?? false,
  logging: dbConfig.logging ?? false,
});
