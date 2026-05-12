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

// Auto-load all routes in src/routes
const routesDir = path.join(__dirname, "routes");

fs.readdirSync(routesDir).forEach((file) => {
  if (!file.endsWith(".route.js") && !file.endsWith(".route.ts")) return;

  const name = file.replace(".route.js", "").replace(".route.ts", "");
  const route = require(path.join(routesDir, file)).default;

  app.use(`/api/${name}`, route);
});

export { app };
