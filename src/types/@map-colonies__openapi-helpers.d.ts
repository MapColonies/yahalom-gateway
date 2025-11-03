declare module '@map-colonies/openapi-helpers' {
  export function createRequestSender(config?: unknown): unknown;

  export class RequestSender {
    public constructor(config?: unknown);
    public get(...args: unknown[]): Promise<unknown>;
    public post(...args: unknown[]): Promise<unknown>;
    public patch(...args: unknown[]): Promise<unknown>;
    public delete(...args: unknown[]): Promise<unknown>;
  }
}
