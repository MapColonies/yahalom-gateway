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
    get?: never;
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
      message: string;
    };
    ILogObject: {
      /**
       * Format: int64
       * @description Unique session identifier
       */
      sessionId: number;
      /** @description Severity level of the log */
      severity: string;
      /**
       * Format: date-time
       * @description Timestamp of the log entry
       */
      timeStamp: string;
      /** @description Main message text */
      message: string;
      messageParameters: components['schemas']['IAnalyticLogParameter'];
      /** @description The component generating the log */
      component: string;
      /** @description Type/category of the message */
      messageType: string;
    };
    IAnalyticLogParameter: {
      [key: string]: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
};
export type $defs = Record<string, never>;
export interface operations {
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
          'application/json': components['schemas']['ILogObject'];
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
