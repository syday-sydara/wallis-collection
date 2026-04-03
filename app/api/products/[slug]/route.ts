// app/api/products/[slug]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  ok,
  badRequest,
  serverError,
  notFound
} from "@/lib/api/response";
import { logEvent } from "@/lib/logger";
import { startTimer } from "@/lib/metrics";
import { checkRateLimit } from "@/lib/api/rate-limit";
import {
  getIdempotentResponse,
  saveIdempotentResponse
} from "@/lib/idempotency";
import type { ProductWithRelations } from "@/lib/catalog/shared/types";

/**
 * GET /api/products/[slug]?limit=24
 * Returns product details + recommended products
 */
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const stopTimer = startTimer("api_products_slug_ms");
  const slug = params.slug;

  // --- Validate slug ---
  if (!slug || slug.length > 200) {
    stopTimer();
    return badRequest("Invalid slug");
  }

  // --- Rate Limit ---
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() || req.ip || "anonymous";

  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    logEvent("rate_limited", { ip, slug }, "warn");
    stopTimer();
    return tooManyRequests(`Rate limit exceeded. Try again in ${rate.retryAfter}s`);
  }

  // --- Idempotency ---
  const idempotencyKey = req.headers.get("x-idempotency-key");
  if (idempotencyKey) {
    const cached = getIdempotentResponse<ProductWithRelations>(idempotencyKey);
    if (cached) {
      stopTimer();
      return ok(cached);
    }
  }

  try {
    // --- Fetch Product ---
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true
      }
    });

    if (!product) {
      logEvent("product_not_found", { slug, ip }, "warn");
      stopTimer();
      return notFound("Product not found");
    }

    // --- Recommended Products ---
    const recommended = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        isArchived: false
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        images: { take: 1 }
      }
    });

    const response = { product, recommended };

    // --- Save Idempotent Response ---
    if (idempotencyKey) {
      saveIdempotentResponse(idempotencyKey, response, 60); // TTL 60s
    }

    logEvent("product_viewed", {
      slug,
      ip,
      recommendedCount: recommended.length
    });

    stopTimer();
    return ok(response);
  } catch (err) {
    stopTimer();
    return serverError("Failed to fetch product", err);
  }
}