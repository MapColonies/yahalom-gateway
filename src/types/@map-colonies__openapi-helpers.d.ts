declare module '@map-colonies/openapi-helpers' {
  export function createRequestSender(config?: any): any;

  export class RequestSender {
    constructor(config?: any);
    get(...args: any[]): Promise<any>;
    post(...args: any[]): Promise<any>;
    patch(...args: any[]): Promise<any>;
    delete(...args: any[]): Promise<any>;
  }
}
