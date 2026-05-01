// services/notification.templates.ts

export type NotificationMessage = {
  subject: string;
  bodyText: string;
  bodyHtml: string;
};

export const NotificationTemplates: Record<
  string,
  (payload: any) => NotificationMessage
> = {
  "order.confirmed": ({ orderId }) => ({
    subject: `Order #${orderId} Confirmed`,
    bodyText: `Your order ${orderId} has been confirmed.`,
    bodyHtml: `<p>Your order <strong>${orderId}</strong> has been confirmed.</p>`,
  }),

  "order.shipped": ({ orderId, trackingNumber }) => ({
    subject: `Order #${orderId} Shipped`,
    bodyText: `Your order ${orderId} has shipped. Tracking: ${trackingNumber}`,
    bodyHtml: `<p>Your order <strong>${orderId}</strong> has shipped.</p>
               <p>Tracking: <strong>${trackingNumber}</strong></p>`,
  }),

  "order.delivered": ({ orderId }) => ({
    subject: `Order #${orderId} Delivered`,
    bodyText: `Your order ${orderId} has been delivered.`,
    bodyHtml: `<p>Your order <strong>${orderId}</strong> has been delivered.</p>`,
  }),

  "payment.success": ({ orderId, amount }) => ({
    subject: `Payment Received`,
    bodyText: `Your payment for order ${orderId} was successful. Amount: ₦${amount}`,
    bodyHtml: `<p>Your payment for order <strong>${orderId}</strong> was successful.</p>
               <p>Amount: <strong>₦${amount}</strong></p>`,
  }),

  "payment.failed": ({ orderId }) => ({
    subject: `Payment Failed`,
    bodyText: `Your payment for order ${orderId} failed. Please try again.`,
    bodyHtml: `<p>Your payment for order <strong>${orderId}</strong> failed.</p>`,
  }),

  "shipment.created": ({ orderId, shipmentId }) => ({
    subject: `Shipment Created`,
    bodyText: `A shipment has been created for order ${orderId}. Shipment ID: ${shipmentId}`,
    bodyHtml: `<p>A shipment has been created for order <strong>${orderId}</strong>.</p>
               <p>Shipment ID: <strong>${shipmentId}</strong></p>`,
  }),

  "shipment.failed_delivery": ({ orderId }) => ({
    subject: `Delivery Attempt Failed`,
    bodyText: `Delivery for order ${orderId} failed. We will contact you.`,
    bodyHtml: `<p>Delivery for order <strong>${orderId}</strong> failed.</p>`,
  }),
};
