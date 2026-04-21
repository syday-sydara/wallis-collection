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
  context: { params: { slug: string } }
) {
  const stopTimer = startTimer("api_products_slug_ms");

  try {
    const rawSlug = context.params.slug;

    if (!rawSlug) {
      return badRequest("Missing slug", { code: "MISSING_SLUG" });
    }

    // Normalize slug
    const slug = rawSlug
      .trim()
      .toLowerCase()
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");

    const slugRegex = /^[a-z0-9-]+$/;

    if (!slug || slug.length < 2 || slug.length > 120 || !slugRegex.test(slug)) {
      return badRequest("Invalid slug", { code: "INVALID_SLUG" });
    }

    // Rate limit
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req.ip ||
      "anonymous";

    const rate = await checkRateLimit(ip, { max: 60, windowMs: 60_000 });

    if (!rate.allowed) {
      logEvent("rate_limited", { ip, slug }, "warn");
      return tooManyRequests(
        `Rate limit exceeded. Try again in ${rate.retryAfter}s`,
        { code: "RATE_LIMITED" }
      );
    }

    // Fetch product
    const productVM = await getProductDetailWithRecommendations(slug);

    if (!productVM) {
      logEvent("product_not_found", { slug, ip }, "warn");
      return notFound(
        "Product not found",
        { code: "NOT_FOUND" },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
          },
        }
      );
    }

    logEvent("product_view", {
      slug,
      productId: productVM.id,
      ip,
    });

    return ok(productVM, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    logEvent("product_detail_error", { error: String(err) }, "error");
    return serverError(
      "Failed to fetch product",
      err,
      { code: "SERVER_ERROR" }
    );
  } finally {
    stopTimer();
  }
}
