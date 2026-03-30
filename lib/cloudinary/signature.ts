import { v2 as cloudinary } from "cloudinary";

const { CLOUDINARY_API_SECRET } = process.env;

/**
 * Generate a Cloudinary upload signature for client-side uploads.
 * Useful for secure unsigned uploads.
 */
export function generateUploadSignature(
  params: Record<string, string | number>
) {
  if (!CLOUDINARY_API_SECRET) {
    throw new Error("Missing CLOUDINARY_API_SECRET");
  }

  return cloudinary.utils.api_sign_request(params, CLOUDINARY_API_SECRET);
}