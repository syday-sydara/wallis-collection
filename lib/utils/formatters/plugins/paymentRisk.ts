// lib/utils/formatters/plugins/paymentRisk.ts
import { RiskEngine } from "../riskEngine";

export function PaymentRiskPlugin(engine: RiskEngine) {
  engine.setCategoryWeight("payment", 2);

  return {
    addStolenCard() {
      engine.addSignal("payment", "stolen_card", 40);
    },
    addHighChargebackHistory() {
      engine.addSignal("payment", "chargeback_history", 30);
    },
    addMismatchedName() {
      engine.addSignal("payment", "name_mismatch", 15);
    },
  };
}
