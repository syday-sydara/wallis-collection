// server/index.ts

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import securityRouter from "./security";

const app = express();

/* -------------------------------------------------- */
/* Core Server Settings                                */
/* -------------------------------------------------- */

// Required for correct IP detection behind proxies
app.set("trust proxy", true);

/* -------------------------------------------------- */
/* Middleware                                          */
/* -------------------------------------------------- */

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://yourapp.com"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

/* -------------------------------------------------- */
/* Health Check                                        */
/* -------------------------------------------------- */

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

/* -------------------------------------------------- */
/* Routers                                             */
/* -------------------------------------------------- */

app.use("/api/security", securityRouter);

/* -------------------------------------------------- */
/* Error Handler                                       */
/* -------------------------------------------------- */

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);

  res.status(500).json({
    error: "Internal Server Error",
    message: err?.message ?? "Unexpected error",
  });
});

/* -------------------------------------------------- */
/* Start Server                                        */
/* -------------------------------------------------- */

const server = app.listen(3000, () => {
  console.log("Server listening on :3000");
});

/* -------------------------------------------------- */
/* Graceful Shutdown                                   */
/* -------------------------------------------------- */

process.on("SIGTERM", () => {
  console.log("Shutting down...");
  server.close(() => process.exit(0));
});
