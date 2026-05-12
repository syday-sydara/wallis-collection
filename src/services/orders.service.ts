import { prisma } from "@/src/lib/prisma";
import { OrdersMapper, OrdersReverseMapper } from "@/src/mappers/";

export class OrdersService {
  static async list() {
    const rows = await prisma.order.findMany();
    return rows.map(OrdersMapper.toDTO);
  }

  static async get(id: string) {
    const row = await prisma.order.findUnique({ where: { id } });
    if (!row) throw new Error("Order not found");
    return OrdersMapper.toDTO(row);
  }

  static async create(input: any) {
    const parsed = OrdersReverseMapper.toPrismaCreate(input);
    const created = await prisma.order.create({ data: parsed });
    return OrdersMapper.toDTO(created);
  }

  static async update(id: string, input: any) {
    const parsed = OrdersReverseMapper.toPrismaUpdate(input);
    const updated = await prisma.order.update({ where: { id }, data: parsed });
    return OrdersMapper.toDTO(updated);
  }

  static async remove(id: string) {
    await prisma.order.delete({ where: { id } });
    return { id };
  }
}
