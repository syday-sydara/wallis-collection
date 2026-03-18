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
    "Shop premium Nigerian fashion including wax prints, super-wax, abayas, ankara, hollands, and luxury lace fabrics crafted with elegance and heritage.",

  keywords: [
    "Wallis Collection",
    "Nigerian fashion",
    "African fashion",
    "wax prints",
    "super-wax",
    "ankara",
    "abayas",
    "hollands",
    "lace fabrics",
    "Nigerian clothing",
    "traditional Nigerian clothing",
    "Nigerian dresses",
    "Nigerian styles",
  ],

  category: "fashion",

  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },

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
    canonical: "/",
    languages: {
      "en-CA": "/",
      "en-US": "/",
      "en-GB": "/",
    },
  },

  openGraph: {
    title: "Wallis Collection",
    description:
      "Discover curated Nigerian fashion: wax prints, super-wax, abayas, ankara, hollands, and elegant lace fabrics.",
    url: "/",
    siteName: "Wallis Collection",
    type: "website",
    locale: "en_CA",
    alternateLocale: ["en_US", "en_GB"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Nigerian wax prints, super-wax, abayas, and luxury lace fabrics",
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

  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#272B36" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1115" },
  ],
};