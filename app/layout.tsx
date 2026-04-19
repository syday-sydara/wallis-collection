import { Inter } from "next/font/google";
import { ClientProviders } from "@/components/ClientProviders";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Wallis Collection",
  description: "Premium Nigerian fashion, crafted with intention.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={cn(
          inter.variable,
          "h-full antialiased bg-surface text-text pt-safe pb-safe"
        )}
      >
        <ClientProviders>
          {children}
        </ClientProviders>

        <div id="portal-root" />
      </body>
    </html>
  );
}
