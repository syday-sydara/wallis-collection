"use client";

export function DeleteConfirm({ productId, image, onClose, onDeleted }) {
  if (!image) return null;

  async function handleDelete() {
    const res = await fetch(
      `/api/admin/products/${productId}/images/${image.id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      onDeleted(image.id);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md space-y-4">
        <h2 className="text-lg font-semibold">Delete Image?</h2>
        <p className="text-sm text-gray-600">
          This will permanently delete the image from Cloudinary.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
