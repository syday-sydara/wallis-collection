// services/customer.service.ts
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/utils/phone";

export const CustomerService = {
  /**
   * Find or create a customer by normalized phone.
   * Ensures:
   *  - strict phone normalization
   *  - no duplicates (phoneNormalized is UNIQUE)
   *  - consistent CRM identity
   */
  async findOrCreate(data: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  }) {
    const phone = normalizePhone(data.phone);
    if (!phone) throw new Error("Invalid phone number");

    // Upsert using phoneNormalized (canonical identity)
    return prisma.customer.upsert({
      where: { phoneNormalized: phone },
      update: {
        name: data.name ?? undefined,
        email: data.email ?? undefined,
      },
      create: {
        phone,
        phoneNormalized: phone,
        name: data.name ?? null,
        email: data.email ?? null,
      },
    });
  },

  /**
   * Update customer safely.
   * Prevents overwriting protected fields.
   */
  async updateCustomer(id: string, data: any) {
    const phone = data.phone ? normalizePhone(data.phone) : undefined;

    return prisma.customer.update({
      where: { id },
      data: {
        name: data.name ?? undefined,
        email: data.email ?? undefined,
        phone: phone ?? undefined,
        phoneNormalized: phone ?? undefined,
      },
    });
  },

  /**
   * Get customer by normalized phone.
   */
  async getByPhone(phone: string) {
    const normalized = normalizePhone(phone);
    if (!normalized) return null;

    return prisma.customer.findUnique({
      where: { phoneNormalized: normalized },
    });
  },
};
