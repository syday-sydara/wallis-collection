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
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, deletedAt: null },
    include: { images: true },
  });

  const fallbackImage =
    "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop";

  const imageUrl =
    product && product.images.length > 0
      ? product.images[0].url
      : fallbackImage;

  const title = product?.name ?? "Wallis Collection";
  const price =
    product?.priceNaira != null
      ? `₦${product.priceNaira.toLocaleString("en-NG")}`
      : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#272B36",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
        }}
      >
        {/* Left: Product image */}
        <div
          style={{
            flex: 1,
            height: "100%",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
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

        {/* Right: Text + branding */}
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

            {product?.description && (
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
                {product.description}
              </div>
            )}
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
            <span>Premium Nigerian Fashion</span>
            <span>walliscollection.com</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
