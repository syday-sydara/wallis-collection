// lib/utils/formatters/plugins/deviceRisk.ts
import { RiskEngine } from "../riskEngine";

export function DeviceRiskPlugin(engine: RiskEngine) {
  engine.setCategoryWeight("device", 1.5);

  return {
    addVPNDetected() {
      engine.addSignal("device", "vpn_detected", 20);
    },
    addNewDevice(daysOld: number) {
      engine.addSignal("device", "new_device", 25, {
        decayDays: 30,
        timestamp: Date.now() - daysOld * 86400000,
      });
    },
    addRootedOrJailbroken() {
      engine.addSignal("device", "rooted_or_jailbroken", 35);
    },
  };
}
