// lib/cloudinary/index.ts

import { v2 as cloudinary } from "cloudinary";

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

/* -------------------------------------------------- */
/* Safe initialization                                 */
/* -------------------------------------------------- */

const missing = [
  ["CLOUDINARY_CLOUD_NAME", CLOUDINARY_CLOUD_NAME],
  ["CLOUDINARY_API_KEY", CLOUDINARY_API_KEY],
  ["CLOUDINARY_API_SECRET", CLOUDINARY_API_SECRET],
].filter(([_, v]) => !v);

if (missing.length > 0) {
  console.error("❌ Cloudinary config missing:", missing.map(([k]) => k));
  throw new Error("Cloudinary environment variables missing");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

/* -------------------------------------------------- */
/* Upload helper                                       */
/* -------------------------------------------------- */

export async function uploadImage(filePath: string, folder = "uploads") {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
    });

    return { ok: true, url: result.secure_url, publicId: result.public_id };
  } catch (err: any) {
    return { ok: false, error: err?.message };
  }
}

/* -------------------------------------------------- */
/* Delete helper                                       */
/* -------------------------------------------------- */

export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { ok: true, result };
  } catch (err: any) {
    return { ok: false, error: err?.message };
  }
}

/* -------------------------------------------------- */
/* Signed upload URL (for client-side uploads)         */
/* -------------------------------------------------- */

export function generateSignedUploadParams(folder = "uploads") {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    folder,
    signature,
    apiKey: CLOUDINARY_API_KEY!,
    cloudName: CLOUDINARY_CLOUD_NAME!,
  };
}

export { cloudinary };
