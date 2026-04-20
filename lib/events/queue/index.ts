import { startQueueWorker } from "./worker";

let started = false;

export function initEventQueue() {
  if (!started) {
    startQueueWorker();
    started = true;
  }
}
