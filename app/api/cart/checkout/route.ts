import { prisma } from "@/lib/db";
import { PaymentMethod, InventoryReason } from "@prisma/client";
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/errors";
import nodemailer from "nodemailer";

// Calculate total in Kobo
function calculateCartTotalKobo(items: any[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, email, phone, fullName, address, city, state, paymentMethod, checkoutSessionId } = body;

    if (!items?.length) throw ApiError.badRequest("Cart is empty");
    if (!email || !phone || !fullName || !address) throw ApiError.badRequest("Missing required shipping information");

    if (checkoutSessionId) {
      const existing = await prisma.order.findUnique({ where: { checkoutSessionId } });
      if (existing) return NextResponse.json({ success: true, orderId: existing.id, paymentUrl: null });
    }

    const totalKobo = calculateCartTotalKobo(items);
    if (totalKobo <= 0) throw ApiError.badRequest("Invalid cart total");

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw ApiError.notFound(`Product ${item.name} not found`);
        if (product.stock < item.quantity) throw ApiError.badRequest(`${product.name} is out of stock`);
      }

      const newOrder = await tx.order.create({
        data: {
          email,
          phone,
          total: totalKobo,
          paymentMethod,
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          cartSnapshot: items,
          checkoutSessionId: checkoutSessionId || undefined,
          items: { create: items.map((i: any) => ({
            productId: i.productId,
            name: i.name,
            image: i.image || null,
            variants: i.variants || {},
            quantity: i.quantity,
            price: i.price,
          })) },
        },
      });

      for (const item of items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        await tx.inventoryMovement.create({ data: { productId: item.productId, change: -item.quantity, reason: InventoryReason.SALE, reference: newOrder.id } });
      }

      return newOrder;
    });

    let paymentUrl = "";

    if (paymentMethod === PaymentMethod.PAYSTACK) {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount: totalKobo, reference: order.id, callback_url: `${process.env.NEXT_PUBLIC_URL}/checkout/verify` }),
      });
      const data = await res.json();
      if (!data.status) throw new Error("Paystack initialization failed");
      paymentUrl = data.data.authorization_url;
    }

    if (paymentMethod === PaymentMethod.MONNIFY) {
      const res = await fetch("https://api.monnify.com/api/v1/merchant/transactions/init-transaction", {
        method: "POST",
        headers: { Authorization: `Basic ${process.env.MONNIFY_AUTH}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalKobo / 100, customerName: fullName, customerEmail: email, paymentReference: order.id, currencyCode: "NGN" }),
      });
      const data = await res.json();
      paymentUrl = data?.responseBody?.checkoutUrl || "";
    }

    // Send email in background
    nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || "587"), auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
      .sendMail({ from: `"Wallis Collection" <${process.env.SMTP_USER}>`, to: email, subject: `Order Confirmation - #${order.id.slice(-6).toUpperCase()}`, html: `<div style="font-family:sans-serif;"><h2>Thanks for your order, ${fullName}!</h2><p>Order ID: ${order.id}</p><p>Amount: ₦${(totalKobo/100).toLocaleString()}</p></div>` })
      .catch(err => console.error("Email failed:", err));

    return NextResponse.json({ success: true, orderId: order.id, paymentUrl });

  } catch (error: any) {
    console.error("Checkout error:", error);
    if (error instanceof ApiError) return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}