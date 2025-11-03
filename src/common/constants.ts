import { readPackageJsonSync } from '@map-colonies/read-pkg';

export const SERVICE_NAME = readPackageJsonSync().name ?? 'unknown_service';
export const DEFAULT_SERVER_PORT = 80;

export const IGNORED_OUTGOING_TRACE_ROUTES = [/^.*\/v1\/metrics.*$/];
export const IGNORED_INCOMING_TRACE_ROUTES = [/^.*\/docs.*$/];

/* eslint-disable @typescript-eslint/naming-convention */
export const SERVICES = {
  LOGGER: Symbol('Logger'),
  CONFIG: Symbol('Config'),
  TRACER: Symbol('Tracer'),
  METRICS: Symbol('METRICS'),
  MESSAGE_REPOSITORY: Symbol('MessageRepository'),
  HEALTH_CHECK: Symbol('HealthCheck'),
  CONNECTION_MANAGER: Symbol('ConnectionManager'),
} satisfies Record<string, symbol>;
/* eslint-enable @typescript-eslint/naming-convention */

export const NOT_FOUND = -1;

export const QUERY_BUILDER_NAME = 'log';

export const DB_TIMEOUT = 5000;

export const MAX_CONNECT_RETRIES = 3;
