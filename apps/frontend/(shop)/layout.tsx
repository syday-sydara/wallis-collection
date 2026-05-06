import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/cn";

export default function Layout({ children }) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col",
        "bg-bg text-text-primary"
      )}
    >
      {/* GLOBAL NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="flex-1 mx-auto w-full max-w-screen-xl px-[var(--space-4)] sm:px-[var(--space-6)] lg:px-[var(--space-8)] py-[var(--space-8)]">
        {children}
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}
