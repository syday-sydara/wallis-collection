import { cloudinary } from "./config";

export async function renameImage(
  oldPublicId: string,
  newPublicId: string
) {
  if (!oldPublicId || !newPublicId) {
    throw new Error("Both oldPublicId and newPublicId are required");
  }

  try {
    return await cloudinary.uploader.rename(oldPublicId, newPublicId);
  } catch (err) {
    console.error("Cloudinary rename failed:", err);
    throw new Error("Failed to rename image");
  }
}
