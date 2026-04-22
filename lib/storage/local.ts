import fs from "fs/promises";
import path from "path";

export async function saveLocalImage(productId: string, file: File) {
  // -----------------------------
  // Validate file
  // -----------------------------
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported file type");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File exceeds 5MB limit");
  }

  // -----------------------------
  // Prepare directories
  // -----------------------------
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "products",
    productId
  );

  await fs.mkdir(uploadDir, { recursive: true });

  // -----------------------------
  // Sanitize filename
  // -----------------------------
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  const filepath = path.join(uploadDir, filename);

  // -----------------------------
  // Save file
  // -----------------------------
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  // -----------------------------
  // Return public URL
  // -----------------------------
  return `/uploads/products/${productId}/${filename}`;
}
