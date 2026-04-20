/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/your-cloud-name/**",
      },
    ],
  },

  async headers() {
    return [
      /* -------------------------------------------------- */
      /* Global Security Headers                             */
      /* -------------------------------------------------- */
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },

          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Modern referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Disable buggy legacy XSS filters
          { key: "X-XSS-Protection", value: "0" },

          // Prevent DNS prefetching leaks
          { key: "X-DNS-Prefetch-Control", value: "off" },

          // Browser isolation (Spectre protection + SharedArrayBuffer)
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },

          // Optional: Enable when fully HTTPS everywhere
          // {
          //   key: "Strict-Transport-Security",
          //   value: "max-age=63072000; includeSubDomains; preload",
          // },
        ],
      },

      /* -------------------------------------------------- */
      /* Static Asset Caching                                */
      /* -------------------------------------------------- */
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      /* -------------------------------------------------- */
      /* Optional CSP (customize before enabling)            */
      /* -------------------------------------------------- */
      // {
      //   source: "/(.*)",
      //   headers: [
      //     {
      //       key: "Content-Security-Policy",
      //       value: `
      //         default-src 'self';
      //         script-src 'self' 'unsafe-inline' 'unsafe-eval';
      //         style-src 'self' 'unsafe-inline';
      //         img-src 'self' data: https:;
      //         font-src 'self' data:;
      //         connect-src 'self' https:;
      //         frame-ancestors 'self';
      //       `.replace(/\s+/g, " "),
      //     },
      //   ],
      // },
    ];
  },
};

export default nextConfig;
