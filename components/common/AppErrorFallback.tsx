// File: components/common/AppErrorFallback.tsx
"use client";

import Image from "next/image";

interface AppErrorFallbackProps {
  error?: Error;
  reset?: () => void;
}

export default function AppErrorFallback({ error, reset }: AppErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Brand Illustration */}
      <div className="mb-8 opacity-90">
        <Image
          src="/brand/error-illustration.svg"
          alt="Something went wrong"
          width={180}
          height={180}
          className="mx-auto"
        />
      </div>

      {/* Headline */}
      <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-3">
        Something went wrong
      </h2>

      {/* Subtext */}
      <p className="text-text-secondary max-w-md mb-6">
        We couldn’t load this section. It might be a temporary issue.  
        {error?.message && (
          <span className="block mt-2 text-sm opacity-70">
            ({error.message})
          </span>
        )}
      </p>

      {/* Retry Button */}
      {reset && (
        <button
          onClick={reset}
          className="px-6 py-2 rounded-md bg-[var(--color-accent-500)] text-white hover:bg-[var(--color-accent-600)] transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
