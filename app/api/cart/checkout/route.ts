import { prisma } from "@/lib/db";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import { calculateCartTotal } from "@/lib/cart/cart";
import { assertStockAvailable } from "@/lib/inventory";
import { ApiError } from "@/lib/errors";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, email, phone, fullName, address, city, state, paymentMethod } = body;

    // 1. Basic Validation
    if (!items?.length) throw ApiError.badRequest("Cart is empty");
    if (!email || !phone || !fullName || !address) {
      throw ApiError.badRequest("Missing required shipping information");
    }

    // 2. Pricing Integrity
    const total = calculateCartTotal(items);
    if (total <= 0) throw ApiError.badRequest("Invalid cart total");

    // 3. Atomic Order Processing
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Validate stock for all items using your inventory utility
      for (const item of items) {
        await assertStockAvailable(item.productId, item.quantity);
      }

      // Step B: Create the Order
    const order = await tx.order.create({
      data: {
        email,
        phone,
        total,
        paymentMethod,
        cartSnapshot: items, // This will now be recognized as a valid property
        items: {
          create: items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            variants: i.variants || {},
          })),
        },
      },
    });
      // Step C: Update Inventory levels and record movements
      for (const item of items) {
        // Decrease stock and create InventoryMovement record
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: "SALE",
            reference: order.id,
          },
        });
      }

      return order;
    });

    // 4. Payment Gateway Handshake (Paystack Example)
    let paymentUrl = "";
    if (paymentMethod === PaymentMethod.PAYSTACK) {
      const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(result.total * 100), // Naira to Kobo
          reference: result.id,
          callback_url: `${process.env.NEXT_PUBLIC_URL}/checkout/verify`,
        }),
      });

      const paystackData = await paystackRes.json();
      if (!paystackData.status) throw new Error("Payment initialization failed");
      paymentUrl = paystackData.data.authorization_url;
    }

    // 5. Send Notification Email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    // Non-blocking email send
    transporter.sendMail({
      from: `"Wallis Collection" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Order Received - #${result.id.slice(-6).toUpperCase()}`,
      html: `<div style="font-family: sans-serif;">
              <h2>Thank you for your order, ${fullName}</h2>
              <p>We've received your order and are processing it.</p>
              <p><b>Order ID:</b> ${result.id}</p>
              <p><b>Total Amount:</b> ₦${result.total.toLocaleString()}</p>
            </div>`,
    }).catch(err => console.error("Email failed to send:", err));

    return NextResponse.json({ 
      success: true, 
      orderId: result.id, 
      paymentUrl 
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    
    // Use your standardized error formatting if it's an ApiError
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" }, 
      { status: 500 }
    );
  }
}