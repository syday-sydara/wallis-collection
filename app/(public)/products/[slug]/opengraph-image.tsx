import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

interface ProductOgImageProps {
  params: { slug: string };
}

export default async function ProductOgImage({ params }: ProductOgImageProps) {
  let product = null;

  try {
    product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: { images: true },
    });
  } catch (err) {
    console.error("OG Image Prisma Error:", err);
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop";

  const imageUrl =
    product?.images?.[0]?.url ?? fallbackImage;

  const title = product?.name ?? "Wallis Collection";
  const price =
    product?.priceNaira != null
      ? `₦${product.priceNaira.toLocaleString("en-NG")}`
      : null;

  const description =
    product?.description ??
    "Premium Northern Nigerian fashion crafted with elegance and heritage.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#272B36",
          color: "#ffffff",
          fontFamily:
            "Space Grotesk, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
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
            background: "#0f1115",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 18,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#A08A81",
              }}
            >
              Wallis Collection
            </div>

            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                lineHeight: 1.1,
                maxWidth: "90%",
              }}
            >
              {title}
            </div>

            {price && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 28,
                  fontWeight: 600,
                  color: "#A08A81",
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
                color: "#c7c7c7",
                maxHeight: 140,
                overflow: "hidden",
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              fontSize: 18,
              color: "#b7b8bb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #2a2f38",
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
    { ...size }
  );
}