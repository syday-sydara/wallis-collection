// app/api/products/[slug]/route.ts
import { NextRequest } from "next/server";
import {
  ok,
  badRequest,
  notFound,
  tooManyRequests,
  serverError,
} from "@/lib/api/response";
import { getProductDetailWithRecommendations } from "@/lib/products/service";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { logEvent } from "@/lib/auth/logger";
import { startTimer } from "@/lib/auth/metrics";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const stopTimer = startTimer("api_products_slug_ms");

  try {
    // --- Extract slug safely ---
    const resolved = await context.params.catch(() => null);
    const rawSlug = resolved?.slug;

    if (!rawSlug) {
      return badRequest("Missing slug");
    }

    // Normalize slug
    const slug = rawSlug
      .trim()
      .toLowerCase()
      .replace(/--+/g, "-") // collapse multiple hyphens
      .replace(/^-+|-+$/g, ""); // trim hyphens

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slug || slug.length < 2 || slug.length > 200 || !slugRegex.test(slug)) {
      return badRequest("Invalid slug");
    }

    // --- Rate Limit ---
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req.ip ||
      "anonymous";

    const rate = await checkRateLimit(ip, { max: 60, windowMs: 60_000 });

    if (!rate.allowed) {
      logEvent("rate_limited", { ip, slug }, "warn");
      return tooManyRequests(
        `Rate limit exceeded. Try again in ${rate.retryAfter}s`
      );
    }

    // --- Fetch product ---
    const productVM = await getProductDetailWithRecommendations(slug);

    if (!productVM) {
      logEvent("product_not_found", { slug, ip }, "warn");
      return notFound("Product not found", undefined, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      });
    }

    logEvent("product_view", { slug, ip });

    return ok(productVM, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    logEvent("product_detail_error", { error: String(err) }, "error");
    return serverError("Failed to fetch product", err);
  } finally {
    stopTimer();
  }
}
