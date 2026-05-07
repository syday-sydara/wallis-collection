// routes/admin/circuit-breakers/index.ts
import { Router } from "express";
import { CircuitBreakers } from "@/lib/circuit-breakers";
import { Correlation } from "@/lib/correlation";
import { logger } from "@/lib/logger";

export const circuitBreakerAdmin = Router();

// ------------------------------------------------------
// List all circuit breakers
// ------------------------------------------------------
circuitBreakerAdmin.get("/", (req, res) => {
  Correlation.withSpan(() => {
    const ctx = Correlation.get();

    const list = Object.entries(CircuitBreakers).map(([name, breaker]) => ({
      name,
      state: breaker.getState(),
    }));

    logger.info("Admin: list circuit breakers", {
      spanId: ctx.spanId,
      parentSpanId: ctx.parentSpanId,
    });

    res.json({ breakers: list });
  });
});

// ------------------------------------------------------
// Get a single breaker
// ------------------------------------------------------
circuitBreakerAdmin.get("/:name", (req, res) => {
  Correlation.withSpan(() => {
    const ctx = Correlation.get();
    const breaker = CircuitBreakers[req.params.name];

    if (!breaker) {
      return res.status(404).json({ error: "Unknown breaker" });
    }

    logger.info("Admin: inspect circuit breaker", {
      breaker: req.params.name,
      spanId: ctx.spanId,
    });

    res.json({
      name: req.params.name,
      state: breaker.getState(),
    });
  });
});

// ------------------------------------------------------
// Force OPEN
// ------------------------------------------------------
circuitBreakerAdmin.post("/:name/force-open", (req, res) => {
  Correlation.withSpan(() => {
    const ctx = Correlation.get();
    const breaker = CircuitBreakers[req.params.name];

    if (!breaker) {
      return res.status(404).json({ error: "Unknown breaker" });
    }

    breaker.forceOpen();

    logger.warn("Admin: force-open circuit breaker", {
      breaker: req.params.name,
      spanId: ctx.spanId,
    });

    res.json({ ok: true, state: breaker.getState() });
  });
});

// ------------------------------------------------------
// Force CLOSED
// ------------------------------------------------------
circuitBreakerAdmin.post("/:name/force-closed", (req, res) => {
  Correlation.withSpan(() => {
    const ctx = Correlation.get();
    const breaker = CircuitBreakers[req.params.name];

    if (!breaker) {
      return res.status(404).json({ error: "Unknown breaker" });
    }

    breaker.forceClosed();

    logger.warn("Admin: force-closed circuit breaker", {
      breaker: req.params.name,
      spanId: ctx.spanId,
    });

    res.json({ ok: true, state: breaker.getState() });
  });
});

// ------------------------------------------------------
// Clear override
// ------------------------------------------------------
circuitBreakerAdmin.post("/:name/clear-override", (req, res) => {
  Correlation.withSpan(() => {
    const ctx = Correlation.get();
    const breaker = CircuitBreakers[req.params.name];

    if (!breaker) {
      return res.status(404).json({ error: "Unknown breaker" });
    }

    breaker.clearOverride();

    logger.info("Admin: clear override", {
      breaker: req.params.name,
      spanId: ctx.spanId,
    });

    res.json({ ok: true, state: breaker.getState() });
  });
});

// ------------------------------------------------------
// Optional: Reset breaker state (wipe Redis)
// ------------------------------------------------------
circuitBreakerAdmin.post("/:name/reset", async (req, res) => {
  Correlation.withSpan(async () => {
    const ctx = Correlation.get();
    const breaker = CircuitBreakers[req.params.name];

    if (!breaker) {
      return res.status(404).json({ error: "Unknown breaker" });
    }

    const key = `circuit:${req.params.name}`;
    await breaker["options"].store?.set(key, null, 1);

    logger.warn("Admin: reset circuit breaker", {
      breaker: req.params.name,
      spanId: ctx.spanId,
    });

    res.json({ ok: true });
  });
});
