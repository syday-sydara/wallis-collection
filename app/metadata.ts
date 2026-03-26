import { Space_Grotesk } from "next/font/google";
import type { Metadata, Viewport } from "next";

/* ------------------------------------------------
   FONT — Editorial, Premium
------------------------------------------------ */
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
  preload: true,
});

/* ------------------------------------------------
   VIEWPORT — Mobile-first, Safe-area aware
------------------------------------------------ */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#272B36",
};

/* ------------------------------------------------
   METADATA — Fermine Edition (Enhanced)
------------------------------------------------ */
export const metadata: Metadata = {
  metadataBase: new URL("https://walliscollection.com"),

  applicationName: "Wallis Collection",
  creator: "Wallis Collection",
  publisher: "Wallis Collection",

  authors: [
    {
      name: "Wallis Collection",
      url: "https://walliscollection.com",
    },
  ],

  title: {
    default: "Wallis Collection",
    template: "%s | Wallis Collection",
  },

  description:
    "Wallis Collection curates premium Nigerian fashion — wax prints, super-wax, ankara, abayas, hollands, and luxury lace fabrics crafted with elegance, heritage, and modern sophistication.",

  keywords: [
    "Wallis Collection",
    "Nigerian fashion",
    "African fashion",
    "wax prints",
    "super-wax",
    "ankara",
    "abayas",
    "lace fabrics",
    "hollands",
    "luxury fabrics",
    "African textiles",
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

  /* ------------------------------------------------
     APPLE WEB APP — Native iOS Feel
  ------------------------------------------------ */
  appleWebApp: {
    capable: true,
    title: "Wallis Collection",
    statusBarStyle: "black-translucent",
  },

  /* ------------------------------------------------
     VERIFICATION — SEO Tools (Optional)
  ------------------------------------------------ */
  verification: {
    google: "",
    pinterest: "",
    yandex: "",
  },

  /* ------------------------------------------------
     OPEN GRAPH — Social Sharing
  ------------------------------------------------ */
  openGraph: {
    title: "Wallis Collection — Premium Nigerian Fashion",
    description:
      "Discover curated Nigerian fashion: wax prints, super-wax, ankara, abayas, hollands, and luxury lace fabrics.",
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

  /* ------------------------------------------------
     TWITTER — Social Cards
  ------------------------------------------------ */
  twitter: {
    card: "summary_large_image",
    title: "Wallis Collection — Premium Nigerian Fashion",
    description:
      "Explore curated Nigerian fashion: wax prints, ankara, abayas, hollands, and luxury lace fabrics.",
    images: [
      "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop",
    ],
  },

  /* ------------------------------------------------
     ICONS & MANIFEST
  ------------------------------------------------ */
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  /* ------------------------------------------------
     THEME COLORS — Light & Dark
  ------------------------------------------------ */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#272B36" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1115" },
  ],

  /* ------------------------------------------------
     OTHER — Brand Metadata
  ------------------------------------------------ */
  other: {
    "brand:name": "Wallis Collection",
    "brand:theme": "Fermine",
    "brand:version": "1.0.0",
  },
};
