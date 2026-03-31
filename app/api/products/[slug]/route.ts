// app/api/products/[slug]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, badRequest, serverError, notFound } from "@/lib/api/response";
import { logEvent } from "@/lib/logger";
import { startTimer } from "@/lib/metrics";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { getIdempotentResponse, saveIdempotentResponse } from "@/lib/idempotency";
import { env } from "@/lib/env";
import type { ProductWithRelations } from "@/lib/catalog/types";

/**
 * GET /api/products/[slug]?limit=24
 * Returns product details + recommended products
 */
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const stopTimer = startTimer("api_products_slug_ms");
  const slug = params.slug;

  // Rate limit based on IP
  const ip = req.ip || "anonymous";
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    logEvent("rate_limited", { ip, slug }, "warn");
    return badRequest(`Rate limit exceeded. Try again in ${Math.ceil(rate.retryAfter / 1000)}s`);
  }

  // Idempotency key (if provided via header)
  const idempotencyKey = req.headers.get("x-idempotency-key");
  if (idempotencyKey) {
    const cached = getIdempotentResponse<ProductWithRelations[]>(idempotencyKey);
    if (cached) {
      stopTimer();
      return ok(cached);
    }
  }

  try {
    // Fetch the product
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
    });

    if (!product) return notFound("Product not found");

    // Simple recommendation: 4 most recently created products excluding current
    const recommended = await prisma.product.findMany({
      where: { id: { not: product.id }, isArchived: false, deletedAt: null },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true, basePrice: true, images: { take: 1 } },
    });

    const response = {
      product,
      recommended,
    };

    if (idempotencyKey) saveIdempotentResponse(idempotencyKey, response);

    logEvent("product_viewed", { slug, ip, recommendedCount: recommended.length });
    stopTimer();
    return ok(response);
  } catch (err) {
    stopTimer();
    return serverError("Failed to fetch product", err);
  }
}