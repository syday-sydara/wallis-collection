// services/customer.service.ts
import { prisma } from "../lib/prisma";
import { normalizePhone } from "../utils/phone";

export const CustomerService = {
  /**
   * Find or create a customer by phone.
   * Ensures:
   *  - phone is normalized
   *  - no duplicates
   *  - consistent CRM identity
   */
  async findOrCreate(data: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  }) {
    const phone = normalizePhone(data.phone);

    if (!phone) {
      throw new Error("Invalid phone number");
    }

    // Check if customer already exists
    const existing = await prisma.customer.findUnique({
      where: { phone },
    });

    if (existing) return existing;

    // Create new customer
    return prisma.customer.create({
      data: {
        name: data.name ?? null,
        email: data.email ?? null,
        phone,
      },
    });
  },

  /**
   * Update customer safely
   */
  async updateCustomer(id: string, data: any) {
    const phone = data.phone ? normalizePhone(data.phone) : undefined;

    return prisma.customer.update({
      where: { id },
      data: {
        ...data,
        phone: phone ?? undefined,
      },
    });
  },

  /**
   * Get customer by normalized phone
   */
  async getByPhone(phone: string) {
    const normalized = normalizePhone(phone);
    if (!normalized) return null;

    return prisma.customer.findUnique({
      where: { phone: normalized },
    });
  },
};
