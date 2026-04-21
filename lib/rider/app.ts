// lib/rider/app.ts
import { prisma } from "@/lib/prisma";
import { verifyRiderSignature } from "./sign";
import { sendDelivered, sendFailed } from "@/lib/whatsapp/events";

export async function getRiderViewData(params: {
  fulfillmentId: string;
  status: string;
  token: string;
}) {
  const { fulfillmentId, status, token } = params;

  const valid = verifyRiderSignature(fulfillmentId, status, token);
  if (!valid) {
    return { ok: false, error: "invalid_signature" as const };
  }

  const fulfillment = await prisma.fulfillment.findUnique({
    where: { id: fulfillmentId },
    include: { order: true },
  });

  if (!fulfillment) {
    return { ok: false, error: "not_found" as const };
  }

  return {
    ok: true as const,
    fulfillment,
    order: fulfillment.order,
  };
}

export async function updateRiderStatus(params: {
  fulfillmentId: string;
  status: "DELIVERED" | "FAILED";
  token: string;
  notes?: string;
}) {
  const { fulfillmentId, status, token, notes } = params;

  const valid = verifyRiderSignature(fulfillmentId, status, token);
  if (!valid) {
    return { ok: false, error: "invalid_signature" as const };
  }

  const fulfillment = await prisma.fulfillment.update({
    where: { id: fulfillmentId },
    data: {
      status,
      riderNotes: notes,
    },
    include: { order: true },
  });

  if (status === "DELIVERED") {
    await sendDelivered(fulfillment.order);
  }

  if (status === "FAILED") {
    await sendFailed(fulfillment.order);
  }

  return { ok: true as const, fulfillment };
}
