// dashboard/queue-dashboard.ts
import express from "express";
import { Queue } from "bullmq";
import { redis } from "../lib/queue/connection";

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import { ALL_QUEUES } from "../queues"; // central registry

export async function mountQueueDashboard(app: express.Express) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/admin/queues");

  const queues = ALL_QUEUES.map(
    (name) => new Queue(name, { connection: redis })
  );

  const adapters = queues.map((q) => new BullMQAdapter(q));

  createBullBoard({
    queues: adapters,
    serverAdapter,
  });

  app.use("/admin/queues", serverAdapter.getRouter());

  console.log("📊 Bull Board mounted at /admin/queues");
}
