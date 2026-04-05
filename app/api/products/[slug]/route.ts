// app/api/products/[slug]/route.ts
import { NextRequest } from "next/server";
import { ok, badRequest, notFound, tooManyRequests, serverError } from "@/lib/api/response";
import { getProductDetailWithRecommendations } from "@/lib/catalog/service";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { logEvent } from "@/lib/logger";
import { startTimer } from "@/lib/metrics";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const stopTimer = startTimer("api_products_slug_ms");

  try {
    const slug = params.slug;

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slug || slug.length > 200 || !slugRegex.test(slug)) {
      return badRequest("Invalid slug");
    }

    // --- Rate Limit ---
    const ip = req.ip || req.headers.get("x-real-ip") || "anonymous";
    const { allowed, retryAfter } = checkRateLimit(ip);

    if (!allowed) {
      logEvent("rate_limited", { ip, slug }, "warn");
      return tooManyRequests(`Rate limit exceeded. Try again in ${retryAfter}s`);
    }

    const productVM = await getProductDetailWithRecommendations(slug);

    if (!productVM) {
      logEvent("product_not_found", { slug, ip }, "warn");
      return notFound("Product not found");
    }

    return ok(productVM, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    return serverError("Failed to fetch product", err);
  } finally {
    stopTimer();
  }
}