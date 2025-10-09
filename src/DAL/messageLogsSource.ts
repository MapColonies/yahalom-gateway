/* istanbul ignore file */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { env } from './../utils/validateEnv';
import { Message } from './entities/Message';

export const messageLogsDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [Message],
  migrations: ['src/DAL/migrations/**/*.ts'],
});
