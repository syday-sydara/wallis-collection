// app/structured-data.tsx
export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Wallis Collection",
          url: "https://walliscollection.com",
          description:
            "Premium Nigerian fashion including wax prints, ankara, and lace fabrics.",
          address: {
            "@type": "PostalAddress",
            addressCountry: "NG",
          },
        }),
      }}
    />
  );
}