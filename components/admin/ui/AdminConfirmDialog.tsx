// components/admin/ui/AdminConfirmDialog.tsx
"use client";

import clsx from "clsx";
import { useModal } from "./modal/AdminModalController";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  danger?: boolean;
}

export function useConfirmDialog() {
  const modal = useModal();

  function confirm({
    title = "Are you sure?",
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    danger = false,
  }: ConfirmOptions) {
    modal.open(
      <div className="space-y-4">
        {title && (
          <h2 className="text-base font-semibold text-text tracking-tight">
            {title}
          </h2>
        )}

        {description && (
          <p className="text-sm text-text-muted">{description}</p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => modal.close()}
            className={clsx(
              "px-3 py-1.5 text-sm rounded-md transition-fast active:scale-press",
              "bg-surface-muted text-text hover:bg-surface-muted/70"
            )}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={() => {
              modal.close();
              onConfirm();
            }}
            className={clsx(
              "px-3 py-1.5 text-sm rounded-md transition-fast active:scale-press text-primary-foreground",
              danger
                ? "bg-danger hover:bg-danger-hover active:bg-danger-active"
                : "bg-primary hover:bg-primary-hover active:bg-primary-active"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    );
  }

  return { confirm };
}
