// components/common/AppAsyncBoundary.tsx
"use client";

import { Suspense } from "react";
import Loading from "@/components/products/Loading";
import AppErrorBoundary from "./AppErrorBoundary";
import AppErrorFallback from "./AppErrorFallback";
import { useToast } from "@/components/toast/ToastProvider";

interface Props {
  children: React.ReactNode;
  count?: number;
  variant?: "grid" | "list" | "compact";
  message?: string | null;
}

export default function AppAsyncBoundary({
  children,
  count = 8,
  variant = "grid",
  message = null,
}: Props) {
  const { showToast } = useToast();

  return (
    <AppErrorBoundary
      fallback={<AppErrorFallback />}
      onError={(error) => {
        showToast("Something went wrong while loading content.", "error");
        console.error("AsyncBoundary error:", error);
      }}
    >
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
    </AppErrorBoundary>
  );
}
