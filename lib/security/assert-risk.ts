import { redirect } from "next/navigation";

export function assertRisk(user: { riskScore: number }) {
  if (user.riskScore >= 70) {
    redirect("/risk-blocked");
  }
}