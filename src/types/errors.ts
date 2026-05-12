export class HttpError extends Error {
  public status: number;
  public body: unknown;
  public traceId?: string;

  constructor(message: string, status: number, body: unknown, traceId?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
    this.traceId = traceId;

    // Ensure proper prototype chain (TS + Node quirk)
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      body: this.body,
      traceId: this.traceId,
    };
  }
}

export class TimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class NetworkError extends Error {
  constructor(message = "Network error") {
    super(message);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class SchemaError extends Error {
  public issues: unknown;

  constructor(message: string, issues: unknown) {
    super(message);
    this.name = "SchemaError";
    this.issues = issues;
    Object.setPrototypeOf(this, SchemaError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      issues: this.issues,
    };
  }
}
