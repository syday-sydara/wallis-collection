// lib/utils/formatters/plugins/behaviorRisk.ts
import { RiskEngine } from "../riskEngine";

export function BehaviorRiskPlugin(engine: RiskEngine) {
  engine.setCategoryWeight("behavior", 1.2);

  return {
    addTooManyAttempts(count: number) {
      engine.addSignal("behavior", "too_many_attempts", Math.min(40, count * 5));
    },
    addSuspiciousPattern() {
      engine.addSignal("behavior", "suspicious_pattern", 25);
    },
    addRapidActions() {
      engine.addSignal("behavior", "rapid_actions", 15);
    },
  };
}

