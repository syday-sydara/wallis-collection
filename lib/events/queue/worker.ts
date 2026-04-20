// lib/events/queue/worker.ts

import { dequeue, requeue, sendToDeadLetter } from "./store";
import { logEvent } from "@/lib/events/pipeline";

const PROCESS_INTERVAL_MS = 50;

async function processItem(item: any) {
  try {
    await logEvent(item.payload);
  } catch (err) {
    item.attempts += 1;

    if (item.attempts >= item.maxAttempts) {
      console.error("[Queue] Dead-lettered event:", item.id);
      sendToDeadLetter(item);
    } else {
      console.warn("[Queue] Retrying event:", item.id);
      requeue(item);
    }
  }
}

export function startQueueWorker() {
  setInterval(async () => {
    const item = dequeue();
    if (!item) return;

    await processItem(item);
  }, PROCESS_INTERVAL_MS);
}
