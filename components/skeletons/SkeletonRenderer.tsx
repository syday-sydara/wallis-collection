// components/skeletons/SkeletonRenderer.tsx
"use client";

import clsx from "clsx";
import { SkeletonRegistry, SkeletonKey } from "./registry";

interface SkeletonRendererProps {
  type: SkeletonKey | string;
  variant?: string;
  className?: string;
}

export default function SkeletonRenderer({
  type,
  variant,
  className,
}: SkeletonRendererProps) {
  const Component =
    SkeletonRegistry[type as SkeletonKey] ?? SkeletonRegistry._fallback;

  if (!SkeletonRegistry[type as SkeletonKey] && process.env.NODE_ENV === "development") {
    console.warn(
      `[SkeletonRenderer] Unknown skeleton type "${type}". Using fallback skeleton.`
    );
  }

  return (
    <Component
      variant={variant}
      className={clsx("animate-pulse opacity-80", className)}
    />
  );
}
