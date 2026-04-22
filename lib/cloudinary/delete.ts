import { cloudinary } from "./config";

export async function deleteImage(publicId: string) {
  if (!publicId) throw new Error("publicId is required");

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    console.error("Cloudinary delete failed:", err);
    throw new Error("Failed to delete image");
  }
}
