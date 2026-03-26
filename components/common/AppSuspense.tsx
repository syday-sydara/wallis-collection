// File: components/common/AppSuspense.tsx
"use client";

import { Suspense } from "react";
import Loading from "@/components/products/Loading";

interface AppSuspenseProps {
  children: React.ReactNode;
  count?: number;
  variant?: "grid" | "list" | "compact";
  message?: string | null;
}

export default function AppSuspense({
  children,
  count = 8,
  variant = "grid",
  message = null,
}: AppSuspenseProps) {
  return (
    <Suspense
      fallback={
        <Loading
          count={count}
          variant={variant}
          message={message}
          showSpinner
        />
      }
    >
      {children}
    </Suspense>
  );
}
