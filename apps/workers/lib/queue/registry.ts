// lib/queue/registry.ts
import { Queue } from "bullmq";
import { redis } from "./connection";

const queues = new Map<string, Queue>();

export function getQueue(name: string): Queue {
  if (!queues.has(name)) {
    queues.set(
      name,
      new Queue(name, {
        connection: redis,
        prefix: "bull", // Nigeria‑first Redis key isolation
      })
    );
  }

  return queues.get(name)!;
}
