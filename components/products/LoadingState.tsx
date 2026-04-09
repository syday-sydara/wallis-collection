"use client";

import Image from "next/image";

type LoadingStateProps = {
  title?: string;
  description?: string;
  spinnerSrc?: string; // path to your spinner image
  className?: string;
  fullscreen?: boolean; // optional fullscreen overlay
  spinnerSize?: number; // allows custom spinner size in px
};

export default function LoadingState({
  title = "Loading...",
  description = "Please wait while we fetch the data.",
  spinnerSrc = "/spinner.svg", // default spinner
  className,
  fullscreen = false,
  spinnerSize = 48,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`
        flex flex-col items-center justify-center
        text-center px-4 py-16 animate-fadeIn
        ${fullscreen ? "fixed inset-0 bg-bg-muted/50 z-modal" : ""}
        ${className ?? ""}
      `}
    >
      {/* Spinner */}
      <div
        className="mb-4 flex items-center justify-center"
        aria-label="Loading"
      >
        <Image
          src={spinnerSrc}
          alt="Loading"
          width={spinnerSize}
          height={spinnerSize}
          className={`animate-spin w-[${spinnerSize}px] h-[${spinnerSize}px] sm:w-[${spinnerSize * 1.5}px] sm:h-[${spinnerSize * 1.5}px]`}
          priority
        />
      </div>

      {/* Title */}
      <p className="text-lg sm:text-xl font-semibold text-text-primary">
        {title}
      </p>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm sm:text-base text-text-secondary max-w-prose">
          {description}
        </p>
      )}
    </div>
  );
}