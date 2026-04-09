// components/admin/ui/AdminModal.tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface AdminModalProps {
  open: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function AdminModal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  className,
}: AdminModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={clsx(
          "relative z-10 w-full max-w-lg rounded-md border border-border bg-surface-card shadow-lg",
          "p-4 sm:p-5 space-y-3 transition-fast",
          className
        )}
      >
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h2 className="text-base font-semibold tracking-tight text-text">
                {title}
              </h2>
            )}

            {description && (
              <p className="text-sm text-text-muted">{description}</p>
            )}
          </div>
        )}

        <div>{children}</div>

        {footer && (
          <div className="pt-2 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
