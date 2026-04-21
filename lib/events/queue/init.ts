// lib/events/queue/init.ts

import { startQueueWorker } from "./worker";

/**
 * Ensures the event queue worker is started exactly once.
 * Works safely in serverless, dev hot-reload, and multi-import environments.
 */

declare global {
  // Prevents multiple workers in dev or serverless
  // by attaching the flag to the global scope.
  // (Node.js keeps globalThis stable across imports)
  // eslint-disable-next-line no-var
  var __EVENT_QUEUE_STARTED__: boolean | undefined;
}

export function initEventQueue() {
  if (globalThis.__EVENT_QUEUE_STARTED__) {
    return;
  }

  globalThis.__EVENT_QUEUE_STARTED__ = true;

  try {
    startQueueWorker();
  } catch (err) {
    console.error("Failed to start event queue worker:", err);
    globalThis.__EVENT_QUEUE_STARTED__ = false;
  }
}
