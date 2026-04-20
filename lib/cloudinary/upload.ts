'use server';
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

// Validate env vars early
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error("Missing Cloudinary environment variables");
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary.
 * @param filePath - Local file path or remote URL
 * @param folder - Cloudinary folder (default: "wallis")
 */
export async function uploadImage(
  filePath: string,
  folder = "wallis"
): Promise<UploadApiResponse> {
  try {
    return await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
      transformation: [
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw new Error("Image upload failed");
  }
}

export default cloudinary;
