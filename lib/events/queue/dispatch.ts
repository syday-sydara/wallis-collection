// lib/events/queue/dispatch.ts

import crypto from "crypto";
import { enqueue } from "./store";

export function enqueueEvent(payload: any) {
  enqueue({
    id: crypto.randomUUID(),
    payload,
    attempts: 0,
    maxAttempts: 5,
  });
}
