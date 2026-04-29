// server/trpc/context.ts

import { inferAsyncReturnType } from "@trpc/server";
import type { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
  riskResult?: any;
  riskChallengeRequired?: boolean;
}

function extractIp(req: Request): string | null {
  const xf = req.headers["x-forwarded-for"];

  if (typeof xf === "string") {
    return xf.split(",")[0].trim();
  }

  if (Array.isArray(xf) && xf.length > 0) {
    return xf[0];
  }

  return typeof req.ip === "string" ? req.ip : null;
}

export async function createContext(opts: { req: AuthenticatedRequest; res: Response }) {
  const { req, res } = opts;

  const ip = extractIp(req);
  const userAgentHeader = req.headers["user-agent"];
  const userAgent = typeof userAgentHeader === "string" ? userAgentHeader : null;

  return {
    req,
    res,
    userId: req.user?.id ?? null,
    ip,
    userAgent,

    // Risk metadata from middleware
    riskResult: req.riskResult ?? null,
    riskChallengeRequired: req.riskChallengeRequired ?? false,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
