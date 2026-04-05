// app/api/products/[slug]/route.ts
import { NextRequest } from "next/server";
import { ok, badRequest, notFound, tooManyRequests, serverError } from "@/lib/api/response";
import { getProductDetailWithRecommendations } from "@/lib/catalog/service";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { logEvent } from "@/lib/logger";
import { startTimer } from "@/lib/metrics";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const stopTimer = startTimer("api_products_slug_ms");
  const slug = params.slug;

  if (!slug || slug.length > 200) {
    stopTimer();
    return badRequest("Invalid slug");
  }

  // --- Rate Limit ---
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() || req.ip || "anonymous";
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    logEvent("rate_limited", { ip, slug }, "warn");
    stopTimer();
    return tooManyRequests(`Rate limit exceeded. Try again in ${retryAfter}s`);
  }

  try {
    const productVM = await getProductDetailWithRecommendations(slug);
    if (!productVM) {
      logEvent("product_not_found", { slug, ip }, "warn");
      stopTimer();
      return notFound("Product not found");
    }

    logEvent("product_viewed", { slug, ip, recommendedCount: productVM.recommended?.length ?? 0 });
    stopTimer();
    return ok(productVM);
  } catch (err) {
    stopTimer();
    return serverError("Failed to fetch product", err);
  }
}