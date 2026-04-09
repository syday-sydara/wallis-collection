// components/ui/Drawer.tsx
import { Overlay } from "./Overlay";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  height?: "sm" | "md" | "lg" | "full";
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  hideCloseButton = false,
  closeOnOutsideClick = true,
  height = "md",
}: DrawerProps) {
  const heightClasses = {
    sm: "h-[35vh]",
    md: "h-[50vh]",
    lg: "h-[75vh]",
    full: "h-[100vh]",
  };

  return (
    <Overlay
      open={open}
      onClose={onClose}
      closeOnOutsideClick={closeOnOutsideClick}
      className="items-end justify-center bg-black/40 backdrop-blur-sm"
      ariaLabelledBy={title ? "drawer-title" : undefined}
      ariaDescribedBy={description ? "drawer-description" : undefined}
    >
      <div
        className={cn(
          "w-full bg-surface rounded-t-lg border-t border-border shadow-lg animate-fadeIn-fast animate-slideUp overflow-hidden",
          heightClasses[height]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              {title && (
                <h2 id="drawer-title" className="text-lg font-semibold text-text">
                  {title}
                </h2>
              )}
              {description && (
                <p id="drawer-description" className="text-sm text-text-muted mt-0.5">
                  {description}
                </p>
              )}
            </div>

            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -m-2 text-text-muted hover:text-text active:scale-press transition-transform"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] overflow-y-auto h-full text-text">
          {children}
        </div>

        {footer && (
          <div className="border-t border-border p-4 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </Overlay>
  );
}