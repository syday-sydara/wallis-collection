// lib/admin/hooks/useImages.ts
"use client";

import { useState } from "react";
import admin from "../client";

export function useImages(productId: string, initial = []) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    try {
      const img = await admin.images.upload(productId, file);
      setItems((prev) => [...prev, img]);
      return img;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  async function remove(imageId: string) {
    const old = items;
    setItems((prev) => prev.filter((i) => i.id !== imageId)); // optimistic

    try {
      await admin.images.delete(productId, imageId);
    } catch (err: any) {
      setItems(old); // rollback
      setError(err.message);
      throw err;
    }
  }

  return { items, upload, remove, error };
}
