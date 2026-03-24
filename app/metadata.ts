import { Space_Grotesk } from "next/font/google";
import type { Metadata, Viewport } from "next";

/* ------------------------------------------------
   FONT
------------------------------------------------ */
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
  preload: true,
});

/* ------------------------------------------------
   VIEWPORT (Next.js 14 standard)
------------------------------------------------ */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover", // ✅ better for mobile safe areas
};

/* ------------------------------------------------
   METADATA
------------------------------------------------ */
export const metadata: Metadata = {
  metadataBase: new URL("https://walliscollection.com"),

  applicationName: "Wallis Collection",

  title: {
    default: "Wallis Collection",
    template: "%s | Wallis Collection",
  },

  description:
    "Shop premium Nigerian fashion including wax prints, super-wax, abayas, ankara, hollands, and luxury lace fabrics crafted with elegance and heritage.",

  keywords: [
    "Wallis Collection",
    "Nigerian fashion",
    "African fashion",
    "wax prints",
    "ankara",
    "abayas",
    "lace fabrics",
  ],

  category: "fashion",

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
  },

  alternates: {
    canonical: "https://walliscollection.com",
    languages: {
      "en-CA": "https://walliscollection.com",
      "en-US": "https://walliscollection.com",
      "en-GB": "https://walliscollection.com",
    },
  },

  openGraph: {
    title: "Wallis Collection",
    description:
      "Discover curated Nigerian fashion: wax prints, ankara, abayas, and luxury lace fabrics.",
    url: "https://walliscollection.com",
    siteName: "Wallis Collection",
    type: "website",
    locale: "en_CA",
    alternateLocale: ["en_US", "en_GB"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Premium Nigerian fashion fabrics",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Wallis Collection",
    description:
      "Explore premium Nigerian fashion: wax prints, ankara, abayas, and luxury lace fabrics.",
    images: [
      "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop",
    ],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#272B36" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1115" },
  ],
};