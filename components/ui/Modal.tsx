// components/ui/Modal.tsx
import { Overlay } from "./Overlay";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  hideCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideCloseButton = false,
  closeOnOutsideClick = true,
}: ModalProps) {
  const sizeClasses = {
    sm: "w-[90%] max-w-sm",
    md: "w-[90%] max-w-md",
    lg: "w-[90%] max-w-lg",
  };

  return (
    <Overlay
      open={open}
      onClose={onClose}
      closeOnOutsideClick={closeOnOutsideClick}
      className="items-center justify-center bg-black/40 backdrop-blur-sm"
      ariaLabelledBy={title ? "modal-title" : undefined}
      ariaDescribedBy={description ? "modal-description" : undefined}
    >
      <div
        className={cn(
          "relative rounded-lg border border-border bg-surface shadow-lg overflow-hidden animate-fadeIn-fast focus:outline-none",
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-text leading-snug">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="text-sm text-text-muted mt-0.5">
                  {description}
                </p>
              )}
            </div>

            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -m-2 text-text-muted hover:text-text active:scale-95 transition-transform"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-text">
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