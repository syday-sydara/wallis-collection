"use client";

import Image from "next/image";

type LoadingStateProps = {
  title?: string;
  description?: string;
  spinnerSrc?: string; // path to your spinner image
  className?: string;
};

export default function LoadingState({
  title = "Loading...",
  description = "Please wait while we fetch the data.",
  spinnerSrc = "/spinner.svg", // default spinner
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex flex-col items-center justify-center py-16 px-4 text-center mx-auto animate-fadeIn max-w-full sm:max-w-md ${className ?? ""}`}
    >
      {/* Spinner */}
      <div
        className="mb-4 flex items-center justify-center"
        aria-label="Loading"
      >
        <Image
          src={spinnerSrc}
          alt="Loading"
          width={48}
          height={48}
          className="animate-spin w-12 h-12 sm:w-16 sm:h-16"
          priority
        />
      </div>

      {/* Title */}
      <p className="text-lg sm:text-xl font-semibold text-text">{title}</p>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm sm:text-base text-text-muted max-w-prose">
          {description}
        </p>
      )}
    </div>
  );
}