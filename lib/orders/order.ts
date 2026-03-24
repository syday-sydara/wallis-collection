import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";
import { ShipmentStatus } from "@prisma/client";

// Helper to send emails
async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({ from: `"Shop" <${process.env.SMTP_USER}>`, to, subject, html });
}

// Advance order status automatically
export async function advanceOrderStatus(orderId: string, newStatus: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: newStatus as any, updatedAt: new Date() },
  });

  // Notify customer
  await sendEmail(order.email, `Order Update - ${newStatus}`, `
    <p>Your order <b>${order.id}</b> is now <b>${newStatus}</b>.</p>
  `);

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
    },
  });

  // Notify customer
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (order) {
    await sendEmail(order.email, "Your Order has Shipped!", `
      <p>Your order <b>${order.id}</b> has been shipped via ${courier}.</p>
      <p>Tracking Number: <b>${trackingNumber}</b></p>
    `);
  }

  return shipment;
}

// Update shipment status
export async function updateShipmentStatus(shipmentId: string, status: ShipmentStatus, note?: string) {
  const shipment = await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      status,
      updates: { create: { status, note } },
    },
    include: { order: true },
  });

  // Notify customer
  if (shipment.order) {
    await sendEmail(shipment.order.email, `Shipment Update - ${status}`, `
      <p>Your shipment for order <b>${shipment.order.id}</b> is now <b>${status}</b>.</p>
      ${note ? `<p>Note: ${note}</p>` : ""}
    `);
  }

  // Auto mark delivered if final status
  if (status === ShipmentStatus.DELIVERED) {
    await advanceOrderStatus(shipment.orderId, "DELIVERED");
  }

  return shipment;
}