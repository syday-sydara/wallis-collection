// templates/whatsapp.templates.ts
export const whatsappTemplates = {
  order_confirmed: {
    name: "order_confirmed",
    resolve: ({ orderId }: { orderId: string }) => [orderId],
  },

  order_delivered: {
    name: "order_delivered",
    resolve: ({ orderId }: { orderId: string }) => [orderId],
  },

  payment_success: {
    name: "payment_success",
    resolve: ({
      orderId,
      amount,
      currency,
    }: {
      orderId: string;
      amount: number;
      currency: string;
    }) => [orderId, `${amount}`, currency],
  },

  payment_failed: {
    name: "payment_failed",
    resolve: ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => [orderId, reason],
  },

  shipment_created: {
    name: "shipment_created",
    resolve: ({
      orderId,
      tracking,
    }: {
      orderId: string;
      tracking: string;
    }) => [orderId, tracking],
  },

  shipment_failed_delivery: {
    name: "shipment_failed_delivery",
    resolve: ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => [orderId, reason],
  },
};
