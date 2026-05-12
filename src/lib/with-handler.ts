import type { Request, Response, NextFunction } from "express";

interface HandlerResult {
  status?: number;
  data?: any;
}

type Handler =
  | ((req: Request, res: Response) => Promise<any> | any)
  | ((req: Request) => Promise<any> | any)
  | (() => Promise<any> | any);

export function withHandler(fn: Handler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result =
        fn.length >= 2 ? await (fn as any)(req, res) : await (fn as any)(req);

      if (res.headersSent) return;

      // No return → treat as 204 No Content
      if (result === undefined) {
        return res.status(204).end();
      }

      // Support { status, data }
      if (typeof result === "object" && "status" in result) {
        const { status = 200, data } = result as HandlerResult;
        return res.status(status).json({ ok: true, data });
      }

      // Normal success envelope
      res.json({ ok: true, data: result });
    } catch (err: any) {
      // Allow next(err) for custom error middleware
      if (typeof next === "function") return next(err);

      console.error(err);
      res.status(500).json({
        ok: false,
        error: { message: err?.message || "Internal Server Error" },
      });
    }
  };
}
