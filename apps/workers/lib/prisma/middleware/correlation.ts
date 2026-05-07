// middleware/correlation.ts
import { Correlation } from "@/lib/correlation";
import { randomUUID } from "crypto";

export function correlationMiddleware(req, res, next) {
  const ctx = {
    traceId: req.headers["x-trace-id"]?.toString() ?? randomUUID(),
    requestId: randomUUID(),
    spanId: randomUUID(),
  };

  Correlation.run(ctx, () => {
    // Attach correlation IDs to the response for downstream services
    res.setHeader("x-trace-id", ctx.traceId);
    res.setHeader("x-request-id", ctx.requestId);
    res.setHeader("x-span-id", ctx.spanId);

    next();
  });
}
