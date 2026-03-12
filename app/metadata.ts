import { Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://walliscollection.com"),

  title: {
    default: "Wallis Collection",
    template: "%s | Wallis Collection",
  },

  description:
    "Shop premium Nigerian fashion: wax prints, super-wax, abayas, ankara, hollands, and luxury lace fabrics.",

  keywords: [
    // Core brand
    "Wallis Collection",
    "Nigerian fashion",
    "African fashion",

    // Product categories
    "wax prints",
    "super-wax",
    "ankara",
    "abayas",
    "hollands",
    "lace fabrics",

    // Search intent
    "Nigerian clothing",
    "traditional Nigerian clothing",
    "Nigerian dresses",
    "Nigerian styles",
  ],

  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
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
  },

  openGraph: {
    title: "Wallis Collection",
    description:
      "Discover curated Nigerian fashion: wax prints, super-wax, abayas, ankara, hollands, and elegant lace fabrics.",
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
        alt: "Fashion preview showcasing Nigerian wax prints, super-wax, and elegant styles",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Wallis Collection",
    description:
      "Explore premium Nigerian fashion: wax prints, super-wax, abayas, ankara, hollands, and luxury laces.",
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

  themeColor: "#272B36",
};