// middleware/correlation.ts
import { Correlation } from "../../correlation";
import { randomUUID } from "crypto";

export function correlationMiddleware(req, res, next) {
  const ctx = {
    traceId: req.headers["x-trace-id"]?.toString() ?? randomUUID(),
    requestId: randomUUID(),
  };

  Correlation.run(ctx, () => next());
}
