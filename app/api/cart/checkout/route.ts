import { prisma } from "@/lib/db";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer"; // for email

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, email, phone, fullName, address, city, state, paymentMethod } = body;

    if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    if (!email || !phone || !fullName) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const total = items.reduce((sum: number, i: any) => sum + i.priceNaira * i.quantity, 0);
    if (total <= 0) return NextResponse.json({ error: "Invalid cart total" }, { status: 400 });

    // Transaction: create order + items + inventory movements
    const order = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          email,
          phone,
          total,
          paymentMethod,
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          cartSnapshot: items,
          items: {
            create: items.map((i: any) => ({
              productId: i.id,
              quantity: i.quantity,
              price: i.priceNaira,
            })),
          },
        },
      });

      // Update stock and create inventory movements
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product) throw new Error(`Product ${item.id} not found`);

        // Decrement stock
        await tx.product.update({
          where: { id: item.id },
          data: { stock: product.stock - item.quantity },
        });

        // Record inventory movement
        await tx.inventoryMovement.create({
          data: {
            productId: item.id,
            change: -item.quantity,
            reason: "SALE",
            reference: order.id,
          },
        });
      }

      return order;
    });

    // Optional: Payment initialization (Paystack / Monnify)
    let paymentUrl = "";
    if (paymentMethod === PaymentMethod.PAYSTACK) {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount: total * 100, reference: order.id }),
      });
      const data: any = await res.json();
      paymentUrl = data?.data?.authorization_url ?? "";
    }

    if (paymentMethod === PaymentMethod.MONNIFY) {
      const res = await fetch("https://api.monnify.com/api/v1/merchant/transactions/init-transaction", {
        method: "POST",
        headers: { Authorization: `Basic ${process.env.MONNIFY_AUTH}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, customerName: fullName, customerEmail: email, paymentReference: order.id, currencyCode: "NGN" }),
      });
      const data: any = await res.json();
      paymentUrl = data?.responseBody?.checkoutUrl ?? "";
    }

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Shop" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Order Confirmation",
      html: `<p>Hi ${fullName},</p>
             <p>Thank you for your order! Your order ID is <b>${order.id}</b>.</p>
             <p>Total: ₦${total.toLocaleString()}</p>
             <p>We will notify you when your order is shipped.</p>`,
    });

    return NextResponse.json({ orderId: order.id, paymentUrl, cartSnapshot: order.cartSnapshot });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}