"use client";

import { useState, useRef, useEffect, KeyboardEvent, TouchEvent } from "react";
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
  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: TouchEvent) {
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
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowRight" && activeIndex < images.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
    if (e.key === "ArrowLeft" && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
    if (e.key === "Escape") {
      setIsZoomed(false);
    }
  }

  /* ---------------- Scroll Lock on Zoom ---------------- */
  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isZoomed]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-muted"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-skeleton animate-shimmer" />
        )}

        <Image
          src={activeImage.url}
          alt={activeImage.alt ?? "Product image"}
          fill
          sizes="100vw"
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoadingComplete={() => setIsLoading(false)}
          onClick={() => setIsZoomed(true)}
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
              className={`rounded-md p-0.5 transition-colors ${
                isActive
                  ? "border-2 border-primary"
                  : "border border-border"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                width={64}
                height={64}
                className="object-cover rounded-md"
              />
            </button>
          );
        })}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-modal bg-black/80 flex items-center justify-center animate-fadeIn"
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
