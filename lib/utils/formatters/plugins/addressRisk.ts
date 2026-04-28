// lib/utils/formatters/plugins/addressRisk.ts
import { RiskEngine } from "../riskEngine";

export function AddressRiskPlugin(engine: RiskEngine) {
  engine.setCategoryWeight("address", 1);

  return {
    addHighRiskRegion() {
      engine.addSignal("address", "high_risk_region", 30);
    },
    addMismatch() {
      engine.addSignal("address", "address_mismatch", 20);
    },
    addPOBox() {
      engine.addSignal("address", "po_box_detected", 10);
    },
  };
}
