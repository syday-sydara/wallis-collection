// dashboard/queue-dashboard.ts
import fs from "fs";
import path from "path";
import express from "express";
import { Queue } from "bullmq";
import { redis } from "../lib/queue/connection";

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

export async function mountQueueDashboard(app: express.Express) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/admin/queues");

  const workersDir = path.join(__dirname, ".."); // root folder with workers
  const queueNames = await findQueueNames(workersDir);

  const queues = queueNames.map(
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

async function findQueueNames(dir: string): Promise<string[]> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".worker.ts"))
    .map((e) => e.name.replace(".worker.ts", ""));
}
