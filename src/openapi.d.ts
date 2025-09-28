/* eslint-disable */
import type { TypedRequestHandlers as ImportedTypedRequestHandlers } from '@map-colonies/openapi-helpers/typedRequestHandler';
export type paths = {
  '/message': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets the messages filtered */
    get: operations['getMessages'];
    put?: never;
    /** Creates a new message */
    post: operations['createMessage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
};
export type webhooks = Record<string, never>;
export type components = {
  schemas: {
    /** @example {
     *       "message": "Invalid message ID provided."
     *     } */
    error: {
      /** @description A human-readable error message */
      message: string;
    };
    /** @enum {string} */
    SeverityEnum: 'EMERGENCY' | 'ALERT' | 'CRITICAL' | 'ERROR' | 'WARNING' | 'NOTICE' | 'INFORMATIONAL' | 'DEBUG';
    /** @enum {string} */
    ComponentEnum: 'GENERAL' | 'MAP' | 'FTUE' | 'SIMULATOR';
    /** @enum {string} */
    MessageTypeEnum:
      | 'APPSTARTED'
      | 'APPEXITED'
      | 'USERDETAILS'
      | 'USERMACHINESPEC'
      | 'USERDEVICES'
      | 'DEVICECONNECTED'
      | 'DEVICEDISCONNECTED'
      | 'GAMEMODESTARTED'
      | 'GAMEMODEENDED'
      | 'IDLETIMESTARTED'
      | 'IDLETIMEENDED'
      | 'LAYERUSESTARTED'
      | 'LAYERUSERENDED'
      | 'MULTIPLAYERSTARTED'
      | 'MULTIPLAYERENDED'
      | 'LOCATION'
      | 'ERROR'
      | 'GENERALINFO'
      | 'WARNING'
      | 'CONSUMPTIONSTATUS'
      | 'APPLICATIONDATA';
    CreateLogObject: {
      /**
       * Format: int64
       * @description Unique session identifier
       */
      sessionId: number;
      severity: components['schemas']['SeverityEnum'];
      /**
       * Format: date-time
       * @description Timestamp of the log entry
       */
      timeStamp: string;
      /** @description Main message text */
      message: string;
      /** @description Additional info */
      messageParameters?: {
        [key: string]: unknown;
      } | null;
      component: components['schemas']['ComponentEnum'];
      messageType: components['schemas']['MessageTypeEnum'];
    };
    ILogObject: components['schemas']['CreateLogObject'] & {
      /**
       * Format: uuid
       * @description Unique identifier of the log entry
       */
      id: string;
    };
  };
  responses: never;
  parameters: {
    SessionId: number;
    Severity: components['schemas']['SeverityEnum'];
    Component: components['schemas']['ComponentEnum'];
    MessageType: components['schemas']['MessageTypeEnum'];
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
};
export type $defs = Record<string, never>;
export interface operations {
  getMessages: {
    parameters: {
      query?: {
        sessionId?: components['parameters']['SessionId'];
        severity?: components['parameters']['Severity'];
        component?: components['parameters']['Component'];
        messageType?: components['parameters']['MessageType'];
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ILogObject'][];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['error'];
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['error'];
        };
      };
    };
  };
  createMessage: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateLogObject'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            id?: string;
          };
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['error'];
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['error'];
        };
      };
    };
  };
}
export type TypedRequestHandlers = ImportedTypedRequestHandlers<paths, operations>;
