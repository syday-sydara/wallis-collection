// PATH: app/api/payments/paystack/verify/route.ts
// NAME: route.ts

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyPaystackPayment } from "@/lib/verify-payment";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  // 1. Guard clause: Ensure we have a reference to check
  if (!reference) {
    return NextResponse.redirect(new URL("/checkout/failed?reason=missing_reference", req.url));
  }

  try {
    // 2. Ask Paystack for the true status of this transaction
    const paystackRes = await verifyPaystackPayment(reference);

    if (!paystackRes.status || !paystackRes.data) {
      console.error("Invalid Paystack response:", paystackRes);
      return NextResponse.redirect(new URL("/checkout/failed?reason=verification_failed", req.url));
    }

    const paymentData = paystackRes.data;
    
    // In our checkout route, we set the Paystack reference to match our Prisma Order ID
    const orderId = paymentData.reference; 

    // 3. Handle a SUCCESSFUL payment
    if (paymentData.status === "success") {
      // Verify the amount paid matches the order total (optional but recommended)
      // Note: Paystack returns amount in Kobo, so we compare Kobo to Kobo
      
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          orderStatus: "PROCESSING", // Move out of PENDING
        },
      });

      // Redirect the user to the UI success page
      return NextResponse.redirect(new URL(`/checkout/success?order=${orderId}`, req.url));
    } 
    
    // 4. Handle a FAILED or ABANDONED payment
    else {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "FAILED",
        },
      });

      return NextResponse.redirect(new URL(`/checkout/failed?order=${orderId}`, req.url));
    }

  } catch (error) {
    console.error("Payment Verification Error:", error);
    // If the server crashes during verification, send them to a generic error page
    return NextResponse.redirect(new URL("/checkout/failed?reason=server_error", req.url));
  }
}