"use client";

import { useModal } from "./AdminModalController";
import { AdminModalHeader } from "./AdminModalHeader";
import { AdminModalFooter } from "./AdminModalFooter";

export function useConfirmModal() {
  const modal = useModal();

  function confirm(message: string, onConfirm: () => void) {
    modal.open(
      <div>
        <AdminModalHeader title="Confirm" />

        <p className="text-sm text-text-muted py-2">{message}</p>

        <AdminModalFooter>
          <button
            onClick={modal.close}
            className="btn btn-outline"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              modal.close();
              onConfirm();
            }}
            className="btn btn-danger"
          >
            Confirm
          </button>
        </AdminModalFooter>
      </div>,
      { size: "sm" }
    );
  }

  return { confirm };
}
