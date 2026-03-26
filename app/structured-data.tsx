// app/structured-data.tsx
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Wallis Collection",
    url: "https://walliscollection.com",
    description:
      "Premium Nigerian fashion including wax prints, super-wax, ankara, abayas, hollands, and luxury lace fabrics.",
    image:
      "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop",

    // Brand identity
    brand: {
      "@type": "Brand",
      name: "Wallis Collection",
      logo: "https://walliscollection.com/logo.png",
    },

    // Country-only address (no physical store yet)
    address: {
      "@type": "PostalAddress",
      addressCountry: "NG",
    },

    // Helps Google understand your business category
    department: "Fashion & Apparel",

    // Helps with search enhancements
    sameAs: [
      "https://www.instagram.com/walliscollection",
      "https://www.facebook.com/walliscollection",
      "https://www.tiktok.com/@walliscollection",
    ],

    // Helps Google understand your site structure
    potentialAction: {
      "@type": "SearchAction",
      target: "https://walliscollection.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
