// app/(store)/checkout/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/security/crypto"; // AES-256-GCM helper
import { z } from "zod";

const CheckoutSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  shippingType: z.enum(["STANDARD", "EXPRESS"]),
  paymentMethod: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
});

export async function submitCheckout(_: any, formData: FormData) {
  try {
    const rawItems = JSON.parse(formData.get("items") as string || "[]");
    const parsed = CheckoutSchema.parse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      shippingType: formData.get("shippingType") || "STANDARD",
      paymentMethod: formData.get("paymentMethod"),
      items: rawItems,
    });

    // Fetch products/variants and compute prices server-side
    const products = await prisma.product.findMany({
      where: { id: { in: parsed.items.map(i => i.productId) } },
      select: { id: true, basePrice: true },
    });

    const priceMap = new Map(products.map(p => [p.id, p.basePrice ?? 0]));

    const subtotal = parsed.items.reduce((sum, item) => {
      const unitPrice = priceMap.get(item.productId) ?? 0;
      return sum + unitPrice * item.quantity;
    }, 0);

    // Compute shipping cost server-side too
    const shippingCost = await computeShipping({
      state: parsed.state,
      shippingType: parsed.shippingType,
    });

    const total = subtotal + shippingCost;

    const order = await prisma.order.create({
      data: {
        email: encrypt(parsed.email),
        phone: encrypt(parsed.phone),
        fullName: encrypt(parsed.fullName),
        subtotal,
        shippingCost,
        total,
        currency: "NGN",
        paymentMethod: "CARD", // or map from parsed.paymentMethod
        paymentStatus: "PENDING",
        orderStatus: "CREATED",
        shippingType: parsed.shippingType,
        shippingAddress: {
          fullName: parsed.fullName,
          phone: parsed.phone,
          address: parsed.address,
          city: parsed.city,
          state: parsed.state,
        },
        cartSnapshot: parsed.items,
        items: {
          create: parsed.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: priceMap.get(item.productId) ?? 0,
            name: "", // fill from product if needed
          })),
        },
      },
    });

    return { success: true, orderId: order.id };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        fieldErrors: err.flatten().fieldErrors,
        message: "Please fix the highlighted fields.",
      };
    }

    return { success: false, message: "Something went wrong. Please try again." };
  }
}