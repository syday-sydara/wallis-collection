import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMonnifyPayment } from "@/lib/payments/monnify";
import { confirmPayment } from "@/lib/orders/confirm-payment";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transactionReference } = body;

    if (!transactionReference) {
      return NextResponse.json(
        { success: false, error: "Missing transaction reference" }, 
        { status: 400 }
      );
    }

    // 1. Verify with Monnify API
    const result = await verifyMonnifyPayment(transactionReference);

    // Monnify status for successful payment is usually "PAID"
    if (result.paymentStatus !== "PAID") {
      return NextResponse.json(
        { success: false, error: `Payment status: ${result.paymentStatus}` }, 
        { status: 400 }
      );
    }

    // 2. Map Monnify data to your Order
    // Monnify's paymentReference usually maps to your internal Order ID
    const orderId = result.paymentReference;

    // 3. Security Check: Validate Amount (Kobo/Minor units)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { totalNaira: true, paymentStatus: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Prevent double-processing if the webhook already finished this
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ success: true, message: "Order already processed", orderId });
    }

    // Monnify amount is usually in Naira (float), unlike Paystack's Kobo (int)
    // Check if the amount paid matches our record
    if (Math.abs(result.amountPaid - order.totalNaira) > 0.01) {
       return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // 4. Finalize the Order
    await confirmPayment(orderId);

    return NextResponse.json({ success: true, orderId });

  } catch (error) {
    // Log the actual error for debugging in Vercel/Server logs
    console.error("[MONNIFY_VERIFY_ERROR]:", error);
    
    return NextResponse.json(
      { success: false, error: "Internal server error during verification" }, 
      { status: 500 }
    );
  }
}