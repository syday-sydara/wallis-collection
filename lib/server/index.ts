// server/index.ts

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import securityRouter from "./security";

const app = express();

/* -------------------------------------------------- */
/* Middleware                                          */
/* -------------------------------------------------- */

app.use(helmet());          // Basic security headers
app.use(cors());            // Allow frontend access
app.use(express.json());    // JSON body parsing
app.use(morgan("tiny"));    // Lightweight request logging

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

app.listen(3000, () => {
  console.log("Server listening on :3000");
});
