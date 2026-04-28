// lib/services/RiskService.ts

import { RiskEngine } from "@/lib/utils/formatters/riskScore";
import { PaymentRiskPlugin } from "@/lib/utils/formatters/plugins/paymentRisk";
import { DeviceRiskPlugin } from "@/lib/utils/formatters/plugins/deviceRisk";
import { BehaviorRiskPlugin } from "@/lib/utils/formatters/plugins/behaviorRisk";
import { AddressRiskPlugin } from "@/lib/utils/formatters/plugins/addressRisk";

export class RiskService {
  static createEngine(profile?: string) {
    const engine = new RiskEngine();

    // Load built-in plugins
    const payment = PaymentRiskPlugin(engine);
    const device = DeviceRiskPlugin(engine);
    const behavior = BehaviorRiskPlugin(engine);
    const address = AddressRiskPlugin(engine);

    // Apply profiles
    if (profile === "checkout") {
      engine.useProfile({
        categoryWeights: { payment: 2, device: 1.5 },
        thresholds: { low: 20, medium: 50, high: 75 },
      });
    }

    if (profile === "login") {
      engine.useProfile({
        categoryWeights: { behavior: 2, device: 1.2 },
        thresholds: { low: 10, medium: 40, high: 70 },
      });
    }

    return { engine, payment, device, behavior, address };
  }

  static evaluate(input: (engine: RiskEngine) => void, profile?: string) {
    const { engine, ...plugins } = RiskService.createEngine(profile);

    // Allow caller to add signals
    input(engine);

    const result = engine.calculate();

    // Optional: log to analytics
    RiskService.log(result);

    return result;
  }

  static log(result: any) {
    console.log("Risk Score:", result.total);
    console.log("Risk Level:", result.level);
    console.log("Breakdown:", result.breakdown);
  }
}
