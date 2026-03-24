import { prisma } from "@/lib/db";
import { PaymentMethod, InventoryReason } from "@prisma/client";
import { NextResponse } from "next/server";
import { calculateCartTotal } from "@/lib/cart"; // Import shared logic
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, email, phone, fullName, address, city, state, paymentMethod } = body;

    // 1. Validation
    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!email || !phone || !fullName || !address) {
      return NextResponse.json({ error: "Missing shipping details" }, { status: 400 });
    }

    // 2. Re-calculate total on backend to prevent client-side tampering
    const total = calculateCartTotal(items);
    if (total <= 0) {
      return NextResponse.json({ error: "Invalid cart total" }, { status: 400 });
    }

    // 3. Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // A. Check stock for all items first
      for (const item of items) {
        const product = await tx.product.findUnique({ 
          where: { id: item.productId } 
        });

        if (!product) throw new Error(`Product ${item.name} not found`);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}`);
        }
      }

      // B. Create Order with Items and Variants
      const order = await tx.order.create({
        data: {
          email,
          phone,
          total,
          paymentMethod,
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          cartSnapshot: items, // Save full JSON for audit trail
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price, // Uses the price at time of purchase
              variants: i.variants || {}, // Ensure your schema has a Json field for variants
            })),
          },
        },
      });

      // C. Update Inventory
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

    // 4. Payment Provider Integration (Example: Paystack)
    let paymentUrl = "";
    if (paymentMethod === PaymentMethod.PAYSTACK) {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: result.total * 100, // Paystack expects Kobo
          reference: result.id,
          callback_url: `${process.env.NEXT_PUBLIC_URL}/checkout/verify`,
        }),
      });
      const data = await response.json();
      paymentUrl = data.data.authorization_url;
    }

    // 5. Async Email Confirmation
    // (In production, consider moving this to a background job/webhook)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Wallis Collection" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Order Confirmed: #${result.id.slice(-6).toUpperCase()}`,
      html: `<h1>Thanks for your order, ${fullName}!</h1>
             <p>Your total is ₦${result.total.toLocaleString()}.</p>
             <p>We will notify you once your package ships to ${address}, ${city}.</p>`,
    });

    return NextResponse.json({ orderId: result.id, paymentUrl });

  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order" }, 
      { status: 500 }
    );
  }
}