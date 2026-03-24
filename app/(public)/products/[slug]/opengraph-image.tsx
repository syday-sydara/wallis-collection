import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

// Constants
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop";
const FALLBACK_TITLE = "Wallis Collection";
const FALLBACK_DESCRIPTION =
  "Premium Northern Nigerian fashion crafted with elegance and heritage.";
const FALLBACK_PRICE = "₦0";

// Brand colors and font
const BRAND = {
  primary: "#272B36",
  surface: "#0f1115",
  accent: "#A08A81",
  textPrimary: "#ffffff",
  textSecondary: "#c7c7c7",
  textMuted: "#b7b8bb",
  border: "#2a2f38",
  font: "Space Grotesk, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
};

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

interface ProductOgImageProps {
  params: { slug: string };
}

// Fetch product data using Prisma
async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: true },
    });
    return product || null;
  } catch (err) {
    console.error("OG Image Prisma Error:", err);
    return null;
  }
}

// Open Graph image generation
export default async function ProductOgImage({ params }: ProductOgImageProps) {
  const product = await getProduct(params.slug);

  // Use fallback data if product is not found or missing information
  const imageUrl = product?.images?.[0]?.url ?? FALLBACK_IMAGE;
  const title = product?.name ?? FALLBACK_TITLE;
  const price = product?.priceNaira
    ? `₦${product.priceNaira.toLocaleString("en-NG")}`
    : FALLBACK_PRICE;
  const description = product?.description?.slice(0, 180) ?? FALLBACK_DESCRIPTION;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BRAND.primary,
          color: BRAND.textPrimary,
          fontFamily: BRAND.font,
        }}
      >
        {/* Left: Product image */}
        <div style={{ flex: 1, height: "100%", overflow: "hidden" }}>
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Right: Text */}
        <div
          style={{
            flex: 1,
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: BRAND.surface,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 18,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: BRAND.accent,
              }}
            >
              Wallis Collection
            </div>

            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1.1,
                maxWidth: "90%",
                wordBreak: "break-word",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </div>

            {price && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 30,
                  fontWeight: 600,
                  color: BRAND.accent,
                }}
              >
                {price}
              </div>
            )}

            <div
              style={{
                marginTop: 16,
                fontSize: 18,
                lineHeight: 1.4,
                color: BRAND.textSecondary,
                maxHeight: 140,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              fontSize: 18,
              color: BRAND.textMuted,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `1px solid ${BRAND.border}`,
              paddingTop: 16,
              marginTop: 24,
            }}
          >
            <span>Premium Northern Nigerian Fashion</span>
            <span>walliscollection.com</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}