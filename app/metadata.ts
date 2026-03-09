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
    "Shop premium Nigerian fashion: wax prints, super-wax, abayas, ankara, hollands, and luxury laces.",

  keywords: [
    "Nigerian fashion",
    "Nigerian clothing",
    "wax prints",
    "super-wax",
    "ankara",
    "abayas",
    "hollands",
    "lace fabrics",
    "Nigerian dresses",
    "Nigerian styles",
    "Wallis Collection",
  ],

  openGraph: {
    title: "Wallis Collection",
    description:
      "Discover curated Nigerian fashion: wax, super-wax, abayas, ankara, hollands, and elegant lace fabrics.",
    url: "https://walliscollection.com",
    siteName: "Wallis Collection",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Wallis Collection Fashion Preview",
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
};
