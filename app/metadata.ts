import { Space_Grotesk } from "next/font/google";
import { Metadata } from "next";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

// Global metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://walliscollection.com"),
  title: "Wallis Collection",
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
    url: "/",
    images: [
      {
        url: "/og-homepage.jpg",
        width: 1200,
        height: 630,
        alt: "Wallis Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wallis Collection",
    description:
      "Explore premium Nigerian fashion: wax prints, super-wax, abayas, ankara, hollands, and luxury laces.",
    images: ["/og-homepage.jpg"],
  },
};
