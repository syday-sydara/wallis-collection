"use client";

import React from "react";
import Skeleton from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";

interface LoadingProps {
  count?: number;               // number of skeleton cards to show
  showSpinner?: boolean;        // show spinner at bottom
  message?: string;             // optional loading message
}

export default function Loading({
  count = 8,
  showSpinner = true,
  message,
}: LoadingProps) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className="flex flex-col gap-3">
      <Skeleton shape="block" size="full" className="aspect-[3/4]" />
      <Skeleton shape="text" size="full" className="w-3/4" />
      <Skeleton shape="text" size="md" className="w-1/2" />
      <Skeleton shape="block" size="sm" className="w-full h-10" />
    </div>
  ));

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 w-full mb-4">
        {skeletons}
      </div>

      {message && (
        <p className="text-neutral-600 text-sm mb-2">{message}</p>
      )}

      {showSpinner && <Spinner size="md" color="primary" />}
    </div>
  );
}