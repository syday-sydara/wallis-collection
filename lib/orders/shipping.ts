// PATH: lib/orders/shipping.ts

import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";
import { ShipmentStatus, OrderStatus } from "@prisma/client";

// Email helper
async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Wallis Collection" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

// Advance order status
export async function advanceOrderStatus(orderId: string, newStatus: OrderStatus) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: newStatus },
  });

  await sendEmail(
    order.email,
    `Order Update — ${newStatus}`,
    `
      <p>Your order <b>${order.id}</b> is now <b>${newStatus}</b>.</p>
      <p>Thank you for shopping with Wallis Collection.</p>
    `
  );

  return order;
}

// Create shipment
export async function createShipment(orderId: string, courier: string, trackingNumber: string) {
  const shipment = await prisma.shipment.create({
    data: {
      orderId,
      courier,
      trackingNumber,
      status: ShipmentStatus.PROCESSING,
      updates: {
        create: {
          status: ShipmentStatus.PROCESSING,
          note: "Shipment created",
        },
      },
    },
  });

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (order) {
    await sendEmail(
      order.email,
      "Your Order Has Shipped!",
      `
        <p>Your order <b>${order.id}</b> has been shipped via <b>${courier}</b>.</p>
        <p>Tracking Number: <b>${trackingNumber}</b></p>
        <p>You will receive updates as your package moves.</p>
      `
    );
  }

  return shipment;
}

// Update shipment status
export async function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  note?: string
) {
  const shipment = await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      status,
      updates: {
        create: { status, note },
      },
    },
    include: { order: true },
  });

  if (shipment.order) {
    await sendEmail(
      shipment.order.email,
      `Shipment Update — ${status}`,
      `
        <p>Your shipment for order <b>${shipment.order.id}</b> is now <b>${status}</b>.</p>
        ${note ? `<p>Note: ${note}</p>` : ""}
      `
    );
  }

  // Auto-mark order delivered
  if (status === ShipmentStatus.DELIVERED) {
    await advanceOrderStatus(shipment.orderId, OrderStatus.DELIVERED);
  }

  return shipment;
}
