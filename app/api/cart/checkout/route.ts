import { prisma } from "@/lib/db";
import { PaymentMethod, InventoryReason } from "@prisma/client";
import nodemailer from "nodemailer";
import {
  ApiError,
  handleError,
  handleSuccess,
} from "@/lib/api/response";

// Calculate total in Kobo
function calculateCartTotalKobo(items: any[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
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
      shippingType,
      paymentMethod,
      checkoutSessionId,
    } = body;

    // Basic validation
    if (!items?.length) throw ApiError.badRequest("Cart is empty");
    if (!email || !phone || !fullName)
      throw ApiError.badRequest("Missing customer information");

    if (!shippingType)
      throw ApiError.badRequest("Missing shipping type");

    if (!["DELIVERY", "PICKUP"].includes(shippingType))
      throw ApiError.badRequest("Invalid shipping type");

    if (shippingType === "DELIVERY") {
      if (!address || !city || !state) {
        throw ApiError.badRequest("Missing delivery address details");
      }
    }

    // Prevent duplicate orders
    if (checkoutSessionId) {
      const existing = await prisma.order.findUnique({
        where: { checkoutSessionId },
      });

      if (existing) {
        return handleSuccess({
          orderId: existing.id,
          paymentUrl: null,
        });
      }
    }

    // Total
    const totalKobo = calculateCartTotalKobo(items);
    if (totalKobo <= 0) throw ApiError.badRequest("Invalid cart total");

    // Create order inside transaction
    const order = await prisma.$transaction(async (tx) => {
      // Validate stock
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) throw ApiError.notFound(`Product ${item.name} not found`);
        if (product.stock < item.quantity)
          throw ApiError.badRequest(`${product.name} is out of stock`);
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          email,
          phone,
          fullName,
          total: totalKobo,
          paymentMethod,
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          shippingType,
          address,
          city,
          state,
          cartSnapshot: items,
          checkoutSessionId: checkoutSessionId || undefined,
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              name: i.name,
              image: i.image || null,
              variants: i.variants || {},
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
      });

      // Deduct stock + log inventory movement
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

    // Initialize payment
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
          reference: `WALLIS-${order.id}`,
          callback_url: `${process.env.NEXT_PUBLIC_URL}/checkout/verify`,
        }),
      });

      const data = await res.json();
      if (!data.status) throw ApiError.serverError("Paystack initialization failed");
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
            amount: totalKobo / 100,
            customerName: fullName,
            customerEmail: email,
            paymentReference: `WALLIS-${order.id}`,
            currencyCode: "NGN",
          }),
        }
      );

      const data = await res.json();
      paymentUrl = data?.responseBody?.checkoutUrl || "";
    }

    // Send confirmation email (non-blocking)
    nodemailer
      .createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || "587"),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
      .sendMail({
        from: `"Wallis Collection" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Order Confirmation - #${order.id.slice(-6).toUpperCase()}`,
        html: `
          <div style="font-family:sans-serif;">
            <h2>Thanks for your order, ${fullName}!</h2>
            <p>Order ID: ${order.id}</p>
            <p>Amount: ₦${(totalKobo / 100).toLocaleString()}</p>
          </div>
        `,
      })
      .catch((err) => console.error("Email failed:", err));

    return handleSuccess({
      orderId: order.id,
      paymentUrl,
    });
  } catch (error) {
    return handleError(error);
  }
}
