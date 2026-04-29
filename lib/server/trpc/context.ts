// server/trpc/context.ts

import { inferAsyncReturnType } from "@trpc/server";

export async function createContext(opts: { req: any; res: any }) {
  const { req } = opts;

  const ip =
    req.ip ||
    req.headers["x-forwarded-for"] ||
    null;

  const userAgent = req.headers["user-agent"] ?? null;

  // attach user if you have auth
  const userId = req.user?.id ?? null;

  return {
    req,
    res: opts.res,
    userId,
    ip: typeof ip === "string" ? ip : null,
    userAgent: typeof userAgent === "string" ? userAgent : null,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
