"use client";

import { SkeletonRegistry, SkeletonKey } from "./registry";

interface SkeletonRendererProps {
  type: SkeletonKey;
  variant?: string;
  className?: string;
}

export default function SkeletonRenderer({
  type,
  variant,
  className,
}: SkeletonRendererProps) {
  const Component = SkeletonRegistry[type];

  if (!Component) {
    return null;
  }

  return <Component variant={variant} className={className} />;
}
