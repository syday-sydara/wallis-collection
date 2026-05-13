import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());

// Health
app.get("/api/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ------------------------------------------------------
// FIXED: Async ES Module–compatible route loader
// ------------------------------------------------------
(async () => {
  const routesDir = path.resolve(process.cwd(), "src/routes");

  if (!fs.existsSync(routesDir)) return;

  for (const file of fs.readdirSync(routesDir)) {
    if (!file.endsWith(".route.ts") && !file.endsWith(".route.js")) continue;

    const name = file.replace(/\.route\.(ts|js)$/, "");
    const filePath = path.join(routesDir, file);

    const module = await import(filePath);
    app.use(`/api/${name}`, module.default);
  }
})();


export { app };
