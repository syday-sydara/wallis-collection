import { prisma } from "@/lib/db";
import { PaymentMethod, InventoryReason } from "@prisma/client";
import { NextResponse } from "next/server";
import { calculateCartTotal } from "@/lib/cart";
import { assertStockAvailable } from "@/lib/inventory";
import { ApiError } from "@/lib/errors";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      items, 
      email, 
      phone, 
      fullName, 
      address, 
      city, 
      state, 
      paymentMethod 
    } = body;

    // 1. Validation using your custom ApiError
    if (!items?.length) throw ApiError.badRequest("Cart is empty");
    if (!email || !phone || !fullName || !address) {
      throw ApiError.badRequest("Missing required shipping information");
    }

    // 2. Pricing Integrity
    // calculateCartTotal uses the Naira values from the frontend CartItem
    const totalNaira = calculateCartTotal(items);
    if (totalNaira <= 0) throw ApiError.badRequest("Invalid cart total");

    // 3. Atomic Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Stock Verification (using your inventory lib)
      for (const item of items) {
        await assertStockAvailable(item.productId, item.quantity);
      }

      // Step B: Create the Order
      // Note: We store total as Naira * 100 to match your Kobo-based seed logic
      const order = await tx.order.create({
        data: {
          email,
          phone,
          total: totalNaira, // Keeping as Float/Decimal in Order for reporting
          paymentMethod,
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          cartSnapshot: items, // Save JSON snapshot for audit trail
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              // Store price in Kobo (Int) as seen in seed.ts
              price: Math.round(i.price * 100), 
              variants: i.variants || {},
            })),
          },
        },
      });

      // Step C: Update Stock & Record Movements
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: InventoryReason.SALE,
            reference: order.id,
          },
        });
      }

      return order;
    });

    // 4. Payment Gateway Integration
    let paymentUrl = "";
    
    // Paystack Logic
    if (paymentMethod === PaymentMethod.PAYSTACK) {
      const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(totalNaira * 100), // Paystack requires Kobo (Amount * 100)
          reference: result.id,
          callback_url: `${process.env.NEXT_PUBLIC_URL}/checkout/verify`,
        }),
      });

      const paystackData = await paystackRes.json();
      if (!paystackData.status) throw new Error("Paystack initialization failed");
      paymentUrl = paystackData.data.authorization_url;
    }

    // Monnify Logic (Based on your route.ts snippets)
    if (paymentMethod === PaymentMethod.MONNIFY) {
      const monnifyRes = await fetch("https://api.monnify.com/api/v1/merchant/transactions/init-transaction", {
        method: "POST",
        headers: { 
          Authorization: `Basic ${process.env.MONNIFY_AUTH}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          amount: totalNaira, 
          customerName: fullName, 
          customerEmail: email, 
          paymentReference: result.id, 
          currencyCode: "NGN" 
        }),
      });
      const monnifyData = await monnifyRes.json();
      paymentUrl = monnifyData?.responseBody?.checkoutUrl ?? "";
    }

    // 5. Email Confirmation (Background task)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || "587"),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    // Fire and forget email to keep response time fast
    transporter.sendMail({
      from: `"Wallis Collection" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Order Confirmation - #${result.id.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>Thanks for your order, ${fullName}!</h2>
          <p>We've received your order and it's being processed.</p>
          <hr />
          <p><b>Order ID:</b> ${result.id}</p>
          <p><b>Amount:</b> ₦${totalNaira.toLocaleString()}</p>
          <p><b>Shipping to:</b> ${address}, ${city}, ${state}</p>
          <hr />
          <p>We'll send another email once your items have shipped.</p>
        </div>
      `,
    }).catch(err => console.error("Email notification failed:", err));

    return NextResponse.json({ 
      success: true, 
      orderId: result.id, 
      paymentUrl 
    });

  } catch (error: any) {
    console.error("Checkout Route Error:", error);
    
    // Handle known ApiErrors
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: error.status }
      );
    }

    // Generic fallback
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred processing your order." }, 
      { status: 500 }
    );
  }
}