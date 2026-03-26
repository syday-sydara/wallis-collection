// app/structured-data.tsx
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      /* ------------------------------------------------
         1. Store Schema — Your business identity
      ------------------------------------------------ */
      {
        "@type": "Store",
        "@id": "https://walliscollection.com/#store",
        name: "Wallis Collection",
        url: "https://walliscollection.com",
        description:
          "Premium Nigerian fashion including wax prints, super-wax, ankara, abayas, hollands, and luxury lace fabrics.",
        image:
          "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop",

        brand: {
          "@type": "Brand",
          name: "Wallis Collection",
          logo: "https://walliscollection.com/logo.png",
        },

        address: {
          "@type": "PostalAddress",
          addressCountry: "NG",
        },

        department: "Fashion & Apparel",

        sameAs: [
          "https://www.instagram.com/walliscollection",
          "https://www.facebook.com/walliscollection",
          "https://www.tiktok.com/@walliscollection",
        ],

        potentialAction: {
          "@type": "SearchAction",
          target:
            "https://walliscollection.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },

      /* ------------------------------------------------
         2. Organization Schema — Helps Google understand
            your brand as a business entity
      ------------------------------------------------ */
      {
        "@type": "Organization",
        "@id": "https://walliscollection.com/#organization",
        name: "Wallis Collection",
        url: "https://walliscollection.com",
        logo: "https://walliscollection.com/logo.png",
        sameAs: [
          "https://www.instagram.com/walliscollection",
          "https://www.facebook.com/walliscollection",
          "https://www.tiktok.com/@walliscollection",
        ],
      },

      /* ------------------------------------------------
      3. Website Schema — Helps with Sitelinks Search Box
      ------------------------------------------------ */
      {
        "@type": "WebSite",
        "@id": "https://walliscollection.com/#website",
        url: "https://walliscollection.com",
        name: "Wallis Collection",
        potentialAction: {
          "@type": "SearchAction",
          target:
            "https://walliscollection.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
