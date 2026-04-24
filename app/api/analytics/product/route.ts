import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  const { productId, variantId, type } = body;

  if (!productId || !type) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const current = await tx.productInsights.upsert({
      where: { productId },
      create: { productId },
      update: {},
    });

    let {
      viewCount,
      addToCartCount,
      whatsappClickCount,
      checkoutClickCount,
      purchaseCount,
      abandonmentCount,
      fraudFlagCount,
      variantPopularity,
    } = current;

    const vp = (variantPopularity as any) ?? {};

    const bumpVariant = (field: "views" | "addToCart" | "purchases") => {
      if (!variantId) return;
      vp[variantId] ??= { views: 0, addToCart: 0, purchases: 0 };
      vp[variantId][field] += 1;
    };

    switch (type) {
      case "product_view":
        viewCount += 1;
        bumpVariant("views");
        break;
      case "add_to_cart":
        addToCartCount += 1;
        bumpVariant("addToCart");
        break;
      case "whatsapp_click":
        whatsappClickCount += 1;
        break;
      case "checkout_click":
        checkoutClickCount += 1;
        break;
      case "purchase":
        purchaseCount += 1;
        bumpVariant("purchases");
        break;
      case "variant_selected":
        bumpVariant("views");
        break;
    }

    const safe = (n: number, d: number) => (d > 0 ? n / d : 0);

    await tx.productInsights.update({
      where: { productId },
      data: {
        viewCount,
        addToCartCount,
        whatsappClickCount,
        checkoutClickCount,
        purchaseCount,
        abandonmentCount,
        fraudFlagCount,
        addToCartRate: safe(addToCartCount, viewCount),
        checkoutClickRate: safe(checkoutClickCount, viewCount),
        whatsappClickRate: safe(whatsappClickCount, viewCount),
        conversionRate: safe(purchaseCount, viewCount),
        variantPopularity: vp,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
