// apps/workers/lib/middleware/admin-auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Correlation } from "@/lib/correlation";
import { logger } from "@/lib/logger";

const REQUIRED_ROLE = ["system_admin", "ops_admin"];

export function adminAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    return Correlation.withSpan(() => {
      const ctx = Correlation.get();

      try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
          logger.warn("AdminAuth: Missing token", {
            spanId: ctx.spanId,
            parentSpanId: ctx.parentSpanId,
          });

          return res.status(401).json({ error: "Unauthorized" });
        }

        const token = header.replace("Bearer ", "").trim();

        let payload: any;
        try {
          payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
        } catch (err: any) {
          logger.warn("AdminAuth: Invalid token", {
            error: err.message,
            spanId: ctx.spanId,
          });

          return res.status(401).json({ error: "Invalid token" });
        }

        // Role‑based access
        if (!payload.role || !REQUIRED_ROLE.includes(payload.role)) {
          logger.warn("AdminAuth: Forbidden role", {
            role: payload.role,
            spanId: ctx.spanId,
          });

          return res.status(403).json({ error: "Forbidden" });
        }

        // Attach admin identity to request
        (req as any).admin = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        };

        logger.info("AdminAuth: Access granted", {
          adminId: payload.sub,
          role: payload.role,
          spanId: ctx.spanId,
        });

        next();
      } catch (err: any) {
        logger.error("AdminAuth: Unexpected error", {
          error: err.message,
          spanId: ctx.spanId,
        });

        return res.status(500).json({ error: "Internal error" });
      }
    });
  };
}
