import { Queue } from "bullmq";
import { redis } from "./connection";

export const queue = {
  add(name: string, payload: any, opts: any = {}) {
    const q = new Queue(name, { connection: redis });
    return q.add(name, payload, opts);
  },
};
