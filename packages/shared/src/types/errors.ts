export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: any,
    public traceId?: string
  ) {
    super(message);
  }
}

export class TimeoutError extends Error {}
export class NetworkError extends Error {}
export class SchemaError extends Error {}
