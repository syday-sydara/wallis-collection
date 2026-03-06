"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function ProductGallery({ images }: { images: string[] }) {
  const safeImages =
    Array.isArray(images) && images.length > 0
      ? images
      : ["/placeholder.png"];

  const [active, setActive] = useState(safeImages[0]);
  const [lightbox, setLightbox] = useState(false);

  // Zoom + Pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Pointer tracking
  const pointers = useRef(new Map<number, PointerEvent>());
  const lastDistance = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;

    pointers.current.set(e.pointerId, e);

    // Pinch zoom (two fingers)
    if (pointers.current.size === 2) {
      const [p1, p2] = Array.from(pointers.current.values());
      const dist = Math.hypot(
        p2.clientX - p1.clientX,
        p2.clientY - p1.clientY
      );

      if (lastDistance.current !== 0) {
        const delta = dist / lastDistance.current;
        setScale((prev) => Math.min(Math.max(prev * delta, 1), 4));
      }

      lastDistance.current = dist;
      return;
    }

    // Pan when zoomed
    if (scale > 1) {
      setOffset((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    lastDistance.current = 0;

    // Snap back if zoomed out too far
    if (scale < 1.02) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Main Image */}
        <div
          className="relative aspect-square bg-neutral/10 rounded-xl overflow-hidden shadow-soft cursor-zoom-in"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={active}
            alt="Product image"
            fill
            priority
            className="object-cover transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Thumbnails */}
        <div className="flex gap-4">
          {safeImages.map((img, index) => {
            const isActive = active === img;

            return (
              <button
                key={`${img}-${index}`}
                onClick={() => setActive(img)}
                aria-pressed={isActive}
                className={`
                  relative w-20 h-20 rounded-lg overflow-hidden border transition-all duration-300
                  ${
                    isActive
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-neutral/40 hover:border-primary/60 hover:ring-1 hover:ring-primary/20"
                  }
                `}
              >
                <Image
                  src={img}
                  alt="Product thumbnail"
                  fill
                  className={`object-cover transition-transform duration-300 ${
                    isActive ? "scale-105" : "hover:scale-105"
                  }`}
                  sizes="80px"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox with pinch‑to‑zoom */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => {
            setLightbox(false);
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
        >
          <div
            className="relative w-[90vw] h-[90vh] overflow-hidden touch-none cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <Image
              src={active}
              alt="Zoomed product image"
              fill
              className="object-contain transition-transform duration-150"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              }}
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}