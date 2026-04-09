import { Inter } from "next/font/google";
import defaultTheme from "tailwindcss/defaultTheme";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: defaultTheme.fontFamily.sans,
  weight: ["400", "500", "600"],
});