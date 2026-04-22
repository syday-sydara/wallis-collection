'use server';

import { cloudinary } from "./config";
import type { UploadApiResponse } from "cloudinary";

export async function uploadImage(
  filePath: string,
  folder = "wallis",
  transformations: Record<string, any>[] = [
    { quality: "auto" },
    { fetch_format: "auto" },
  ]
): Promise<{
  url: string;
  width: number;
  height: number;
  publicId: string;
  format: string;
  bytes: number;
}> {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("Invalid file path");
  }

  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: "image",
        transformation: transformations,
      }
    );

    return {
      url: result.secure_url,
      width: result.width!,
      height: result.height!,
      publicId: result.public_id!,
      format: result.format!,
      bytes: result.bytes!,
    };
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw new Error("Image upload failed");
  }
}
