// lib/events/queue/store.ts

export type QueueItem = {
  id: string;
  payload: any;
  attempts: number;
  maxAttempts: number;
};

const queue: QueueItem[] = [];
const deadLetterQueue: QueueItem[] = [];

export function enqueue(item: QueueItem) {
  queue.push(item);
}

export function dequeue(): QueueItem | undefined {
  return queue.shift();
}

export function requeue(item: QueueItem) {
  queue.push(item);
}

export function sendToDeadLetter(item: QueueItem) {
  deadLetterQueue.push(item);
}

export function getQueueSize() {
  return queue.length;
}

export function getDeadLetterSize() {
  return deadLetterQueue.length;
}
