// PATH: app/api/cart/checkout/route.ts
import { prisma } from "@/lib/db";
import { CartItem } from "@/lib/types/types";
import { PaymentMethod, InventoryReason } from "@prisma/client";
import { NextResponse } from "next/server";
import { ApiError, handleError } from "@/lib/errors";
import nodemailer from "nodemailer";

/**
 * Convert cart items (price in Naira) to Kobo for Paystack
 */
function calculateCartTotalKobo(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0);
}

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
      paymentMethod,
      checkoutSessionId,
    }: {
      items: CartItem[];
      email: string;
      phone: string;
      fullName: string;
      address: string;
      city: string;
      state: string;
      paymentMethod: PaymentMethod;
      checkoutSessionId?: string;
    } = body;

    // 1️⃣ Validate required fields
    if (!items?.length) throw ApiError.badRequest("Cart is empty");
    if (!email || !phone || !fullName || !address || !city || !state) {
      throw ApiError.badRequest("Missing required shipping information");
    }

    // 2️⃣ Idempotency check
    if (checkoutSessionId) {
      const existing = await prisma.order.findUnique({ where: { checkoutSessionId } });
      if (existing) {
        return NextResponse.json({
          success: true,
          orderId: existing.id,
          paymentUrl: null,
        });
      }
    }

    // 3️⃣ Calculate total in Kobo
    const totalKobo = calculateCartTotalKobo(items);
    if (totalKobo <= 0) throw ApiError.badRequest("Invalid cart total");

    // 4️⃣ Atomic transaction: stock check + order creation + inventory movement
    const order = await prisma.$transaction(async (tx) => {
      // Stock verification
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw ApiError.notFound(`Product ${item.name} not found`);
        if (product.stock < item.quantity) {
          throw ApiError.badRequest(`${product.name} is out of stock`);
        }
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          email,
          phone,
          fullName,
          address,
          city,
          state,
          total: totalKobo,
          paymentMethod,
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          cartSnapshot: items,
          checkoutSessionId: checkoutSessionId || undefined,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              name: i.name,
              image: i.image || null,
              variants: i.variants || {},
              quantity: i.quantity,
              price: i.price, // in Naira
            })),
          },
        },
      });

      // Update stock & record inventory movements
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
            reference: newOrder.id,
          },
        });
      }

      return newOrder;
    });

    // 5️⃣ Initialize payment
    let paymentUrl = "";

    if (paymentMethod === PaymentMethod.PAYSTACK) {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: totalKobo,
          reference: order.id,
          callback_url: `${process.env.NEXT_PUBLIC_URL}/checkout/verify`,
        }),
      });
      const data = await res.json();
      if (!data.status) throw new Error("Paystack initialization failed");
      paymentUrl = data.data.authorization_url;
    }

    if (paymentMethod === PaymentMethod.MONNIFY) {
      const res = await fetch(
        "https://api.monnify.com/api/v1/merchant/transactions/init-transaction",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${process.env.MONNIFY_AUTH}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalKobo / 100, // Monnify expects Naira
            customerName: fullName,
            customerEmail: email,
            paymentReference: order.id,
            currencyCode: "NGN",
          }),
        }
      );
      const data = await res.json();
      paymentUrl = data?.responseBody?.checkoutUrl || "";
    }

    // 6️⃣ Send order confirmation email (fire & forget)
    nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || "587"),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
      .sendMail({
        from: `"Wallis Collection" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Order Confirmation - #${order.id.slice(-6).toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2>Thanks for your order, ${fullName}!</h2>
            <p>We've received your order and it's being processed.</p>
            <hr />
            <p><b>Order ID:</b> ${order.id}</p>
            <p><b>Amount:</b> ₦${(totalKobo / 100).toLocaleString()}</p>
            <p><b>Shipping to:</b> ${address}, ${city}, ${state}</p>
            <hr />
            <p>We'll send another email once your items have shipped.</p>
          </div>
        `,
      })
      .catch((err) => console.error("Email failed:", err));

    return NextResponse.json({ success: true, orderId: order.id, paymentUrl });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    return handleError(error);
  }
}