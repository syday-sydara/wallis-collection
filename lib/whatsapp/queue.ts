// lib/whatsapp/queue.ts

import { WhatsAppClient } from "./client";

/**
 * A minimal in-memory queue for WhatsApp jobs.
 * 
 * This is intentionally simple:
 * - It never blocks message sending
 * - It can be replaced with BullMQ/SQS/Redis later
 * - It keeps the WhatsAppClient as the single source of truth
 */

export type WhatsAppJob =
  | {
      type: "text";
      to: string;
      message: string;
      tags?: string[];
    }
  | {
      type: "buttons";
      to: string;
      message: string;
      buttons: { id: string; title: string }[];
      tags?: string[];
    }
  | {
      type: "list";
      to: string;
      content: { header?: string; body: string; footer?: string };
      buttonText: string;
      sections: {
        title: string;
        rows: { id: string; title: string; description?: string }[];
      }[];
      tags?: string[];
    }
  | {
      type: "image";
      to: string;
      url: string;
      caption?: string;
      tags?: string[];
    }
  | {
      type: "document";
      to: string;
      url: string;
      filename: string;
      caption?: string;
      tags?: string[];
    };

// In-memory queue (replace with Redis/BullMQ later)
const queue: WhatsAppJob[] = [];

/**
 * Add a job to the queue
 */
export function enqueueWhatsAppJob(job: WhatsAppJob) {
  queue.push(job);
}

/**
 * Process all queued jobs sequentially.
 * 
 * In production, this would run in a worker process.
 */
export async function processWhatsAppQueue() {
  while (queue.length > 0) {
    const job = queue.shift()!;
    const client = new WhatsAppClient(job.to, job.tags ?? []);

    try {
      switch (job.type) {
        case "text":
          await client.text(job.message);
          break;

        case "buttons":
          await client.buttons(job.message, job.buttons);
          break;

        case "list":
          await client.list(job.content, job.buttonText, job.sections);
          break;

        case "image":
          await client.image(job.url, job.caption);
          break;

        case "document":
          await client.document(job.url, job.filename, job.caption);
          break;
      }
    } catch (err) {
      // Queue should never crash the app
      console.error("WhatsApp queue job failed:", err, job);
    }
  }
}
