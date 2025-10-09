/* eslint-disable */
import { cleanEnv, str, port } from 'envalid';

export const env = cleanEnv(process.env, {
  DB_HOST: str(),
  DB_PORT: port({ default: 5432 }),
  DB_USER: str(),
  DB_PASSWORD: str(),
  DB_NAME: str(),
});
