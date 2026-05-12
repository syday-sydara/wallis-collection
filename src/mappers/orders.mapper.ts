export const OrdersMapper = {
  toDTO(entity: any) {
    return {
      id: entity.id,
      customerName: entity.customerName ?? null,
      phoneNumber: entity.phoneNumber ?? null,
      status: entity.status ?? "pending",
      totalAmount: entity.totalAmount ?? 0,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  },
};

const allowedFields = ["customerName", "phoneNumber", "status", "totalAmount"];

export const OrdersReverseMapper = {
  toPrismaCreate(input: any) {
    const data: any = {};
    for (const key of allowedFields) {
      if (input[key] !== undefined) data[key] = input[key];
    }
    data.status ??= "pending";
    data.totalAmount ??= 0;
    return data;
  },

  toPrismaUpdate(input: any) {
    const data: any = {};
    for (const key of allowedFields) {
      if (input[key] !== undefined) data[key] = input[key];
    }
    return data;
  },
};
