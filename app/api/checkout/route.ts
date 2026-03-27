// app/api/checkout/route.ts
import { NextRequest } from "next/server";
import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { processCheckout } from "@/lib/checkout/service";
import { badRequest, ok, serverError } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CheckoutPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return badRequest("Invalid checkout payload", parsed.error.flatten());
    }

    const result = await processCheckout(parsed.data);

    return ok({
      orderId: result.orderId,
      paymentUrl: result.paymentUrl
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return serverError("Unable to process checkout", err);
  }
}
