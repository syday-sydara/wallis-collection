export const OrdersAdminTransformer = {
  toRow(entity: any) {
    return {
      id: entity.id,
      customerName: entity.customerName ?? "—",
      status: entity.status ?? "unknown",

      // Format as Nigerian Naira
      totalAmount: new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(entity.totalAmount ?? 0),

      // Nigerian-friendly date format
      createdAt: new Date(entity.createdAt).toLocaleString("en-NG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),

      updatedAt: new Date(entity.updatedAt).toLocaleString("en-NG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  },
};
