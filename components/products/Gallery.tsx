"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type ImageType = { id?: string; url: string; alt?: string | null };
type Props = { images: ImageType[] };

export default function Gallery({ images }: Props) {
  if (!images.length) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const touchStartX = useRef<number | null>(null);

  const activeImage = images[activeIndex];

  /* ---------------- Swipe ---------------- */
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;

    const delta = e.changedTouches[0].clientX - touchStartX.current;

    if (delta > 50 && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    } else if (delta < -50 && activeIndex < images.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }

    touchStartX.current = null;
  }

  /* ---------------- Keyboard ---------------- */
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" && activeIndex < images.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
    if (e.key === "ArrowLeft" && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative w-full aspect-square rounded-lg overflow-hidden bg-bg-muted"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 skeleton rounded-lg" />
        )}

        <Image
          key={activeImage.url}
          src={activeImage.url}
          alt={activeImage.alt ?? "Product image"}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          sizes="(max-width: 640px) 100vw, 50vw"
          priority
          onLoad={() => setIsLoading(false)}
        />

        {/* Click to zoom */}
        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          className="absolute inset-0 cursor-zoom-in"
          aria-label="Zoom image"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {images.map((img, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={img.id ?? img.url}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setIsLoading(true);
              }}
              aria-selected={isActive}
              className={`
                rounded-md p-0.5 transition-all
                focus-ring
                ${
                  isActive
                    ? "border-2 border-primary scale-95"
                    : "border border-border"
                }
              `}
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-bg-muted">
                <Image
                  src={img.url}
                  alt={img.alt ?? ""}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-modal bg-black/80 flex items-center justify-center"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative w-full max-w-3xl aspect-square">
            <Image
              src={activeImage.url}
              alt={activeImage.alt ?? ""}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Close hint */}
          <button
            className="absolute top-4 right-4 text-white text-sm"
            onClick={() => setIsZoomed(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}