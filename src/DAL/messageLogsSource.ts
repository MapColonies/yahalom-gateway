/* istanbul ignore file */
import config from 'config';
import { DataSource } from 'typeorm';
import { Message } from './entities/message';

interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

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
