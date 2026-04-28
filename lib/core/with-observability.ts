// lib/core/with-observability.ts

import { NextRequest, NextResponse } from "next/server";
import { serviceContext } from "./service-context";
import { AppError } from "./errors";
import { log } from "./log";
import { startSpan } from "./tracing";
import { metricsWithContext } from "./metrics-context";

export function withObservability(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const traceId = crypto.randomUUID();

    const ip = req.headers.get("x-forwarded-for") ?? undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;
    const locale = req.headers.get("accept-language")?.split(",")[0];

    return serviceContext.run(
      { requestId, traceId, ip, userAgent, locale },
      async () => {
        const start = performance.now();

        const span = startSpan("http.request", {
          requestId,
          traceId,
          path: req.nextUrl.pathname,
          method: req.method,
        });

        metricsWithContext.increment("http.requests");

        try {
          const res = await handler(req);

          const duration = performance.now() - start;
          metricsWithContext.timing("http.duration", duration);
          metricsWithContext.increment(`http.status.${res.status}`);

          span.end({
            status: res.status,
            duration,
            success: true,
          });

          return res;
        } catch (err: any) {
          const duration = performance.now() - start;

          metricsWithContext.timing("http.duration", duration);
          metricsWithContext.increment("errors.total");

          // AppError (expected operational errors)
          if (err instanceof AppError) {
            metricsWithContext.increment(`errors.app.${err.code}`);
            metricsWithContext.increment(`http.status.${err.status}`);

            span.end({
              success: false,
              error: err.code,
              message: err.message,
              status: err.status,
              duration,
            });

            log.warn(`AppError: ${err.code}`, err.toJSON());

            return NextResponse.json(
              { error: err.code, message: err.message },
              { status: err.status }
            );
          }

          // Unexpected errors
          metricsWithContext.increment("errors.unhandled");
          metricsWithContext.increment("http.status.500");

          span.end({
            success: false,
            error: err?.message ?? "Unknown error",
            stack: err?.stack,
            status: 500,
            duration,
          });

          log.error("Unhandled error", {
            error: err?.message ?? String(err),
            stack: err?.stack,
          });

          return NextResponse.json(
            { error: "INTERNAL_ERROR", message: "Something went wrong" },
            { status: 500 }
          );
        }
      }
    );
  };
}
