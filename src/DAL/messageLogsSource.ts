/* istanbul ignore file */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Message } from './entities/Message';

export const messageLogsDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [Message],
  migrations: ['src/DAL/migration/**/*.ts'],
});
