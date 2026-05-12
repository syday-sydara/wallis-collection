// API handler wrapper
import type { Request, Response, NextFunction } from "express";

type HandlerFn = (req: Request, res: Response) => Promise<any> | any;
type SimpleHandlerFn = (req: Request) => Promise<any> | any | void;
type NoReqHandlerFn = () => Promise<any> | any;

export function withHandler(fn: HandlerFn | SimpleHandlerFn | NoReqHandlerFn) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = fn.length >= 2 ? await (fn as HandlerFn)(req, res) : await (fn as any)(req);
      if (res.headersSent) return;
      if (result === undefined) return;
      res.json({ ok: true, data: result });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({
        ok: false,
        error: { message: err?.message || "Internal Server Error" },
      });
    }
  };
}
