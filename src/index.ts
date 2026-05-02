import fs from "fs";
import path from "path";

console.log("🚀 BullMQ Worker System Starting...");

const workersDir = path.join(__dirname, "workers");
const workers: any[] = [];

async function findWorkerFiles(dir: string): Promise<string[]> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return findWorkerFiles(fullPath);
      }

      if (entry.isFile() && entry.name.endsWith(".worker.ts")) {
        return [fullPath];
      }

      return [];
    })
  );

  return files.flat();
}

(async () => {
  const workerFiles = await findWorkerFiles(workersDir);

  for (const file of workerFiles) {
    const module = await import(file);
    const worker = module.default || Object.values(module)[0];

    if (!worker) {
      console.warn(`⚠️ No worker exported from ${file}`);
      continue;
    }

    workers.push(worker);
    console.log(`🧵 Loaded worker: ${worker.name}`);
  }

  // Attach listeners
  for (const w of workers) {
    w.on("error", (err: any) => {
      console.error(`❌ Worker error [${w.name}]`, err);
    });

    w.on("failed", (job: any, err: any) => {
      if (!job) {
        console.error(`❌ Job failed [${w.name}] — job undefined`, err);
        return;
      }
      console.error(`❌ Job failed [${w.name}]`, job.name, err);
    });

    w.on("completed", (job: any) => {
      if (!job) {
        console.log(`⚠️ Completed event without job for [${w.name}]`);
        return;
      }
      console.log(`✅ Job completed [${w.name}]`, job.name);
    });
  }
})();
