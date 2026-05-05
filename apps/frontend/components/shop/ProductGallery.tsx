import * as React from "react";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/shared/Modal";

export interface ProductGalleryProps
  extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
}

export function ProductGallery({
  images,
  className,
  ...props
}: ProductGalleryProps) {
  const [active, setActive] = React.useState(0);
  const [zoomOpen, setZoomOpen] = React.useState(false);

  const currentImage = images[active];

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {/* Main Image */}
      <div
        className="w-full aspect-square rounded-md overflow-hidden bg-bg-muted cursor-zoom-in"
        onClick={() => setZoomOpen(true)}
      >
        <img
          src={currentImage}
          alt="Product image"
          className="w-full h-full object-cover transition-all"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "w-16 h-16 rounded-md overflow-hidden border transition-all flex-shrink-0",
              active === i
                ? "border-primary"
                : "border-border hover:border-primary/50"
            )}
          >
            <img
              src={img}
              alt={`Thumbnail ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Zoom Modal */}
      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)}>
        <div className="w-full max-w-3xl mx-auto">
          <img
            src={currentImage}
            alt="Zoomed product"
            className="w-full h-auto rounded-md"
          />
        </div>
      </Modal>
    </div>
  );
}
