import { Space_Grotesk } from "next/font/google";
import { Metadata } from "next";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

// Global metadata
export const metadata: Metadata = {
  title: "Wallis Collection",
  description: "Shop curated African fashion: timeless styles, modern designs.",
  openGraph: {
    title: "Wallis Collection",
    description: "Shop curated African fashion: timeless styles, modern designs.",
    url: "https://walliscollection.com",
    images: [
      {
        url: "/og-homepage.jpg",
        width: 1200,
        height: 630,
        alt: "Wallis Collection",
      },
    ],
  },
};