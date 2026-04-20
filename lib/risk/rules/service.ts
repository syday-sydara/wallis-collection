// lib/risk/service.ts

import type { RiskContext } from "@/lib/risk/types";
import { evaluatePolicy } from "@/lib/risk/engine";

export async function evaluateRisk(
  context: RiskContext,
  policyId: string = "default"
) {
  return evaluatePolicy(context, policyId);
}
