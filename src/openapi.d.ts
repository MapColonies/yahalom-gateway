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
    /** gets the messages filtered */
    get: operations['getMessages'];
    put?: never;
    /** creates a new message */
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
      error: string;
    };
    ILogObject: {
      /**
       * Format: int64
       * @description Unique session identifier
       */
      sessionId: number;
      /**
       * @description Severity level of the log
       * @enum {string}
       */
      severity: 'EMERGENCY' | 'ALERT' | 'CRITICAL' | 'ERROR' | 'WARNING' | 'NOTICE' | 'INFORMATIONAL' | 'DEBUG';
      /**
       * Format: date-time
       * @description Timestamp of the log entry
       */
      timeStamp: string;
      /** @description Main message text */
      message: string;
      messageParameters?: components['schemas']['IAnalyticLogParameter'];
      /**
       * @description The component generating the log
       * @enum {string}
       */
      component: 'GENERAL' | 'MAP' | 'FTUE' | 'SIMULATOR';
      /**
       * @description Type/category of the message
       * @enum {string}
       */
      messageType:
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
    };
    IAnalyticLogParameter: unknown[];
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
};
export type $defs = Record<string, never>;
export interface operations {
  getMessages: {
    parameters: {
      query?: {
        sessionId?: number;
        severity?: 'EMERGENCY' | 'ALERT' | 'CRITICAL' | 'ERROR' | 'WARNING' | 'NOTICE' | 'INFORMATIONAL' | 'DEBUG';
        component?: 'GENERAL' | 'MAP' | 'FTUE' | 'SIMULATOR';
        messageType?:
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
      /** @description No content - no messages found */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description The message for integrating */
            msg: string;
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
        'application/json': components['schemas']['ILogObject'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description The ID of the created message */
            id: number;
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
    };
  };
}
export type TypedRequestHandlers = ImportedTypedRequestHandlers<paths, operations>;
