'use server';

import { cloudinary } from ".";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import type { UploadApiResponse } from "cloudinary";

export async function uploadImage(
  filePath: string,
  folder = "wallis",
  transformations: Record<string, any>[] = [
    { quality: "auto" },
    { fetch_format: "auto" },
  ]
): Promise<
  | {
      ok: true;
      url: string;
      width: number;
      height: number;
      publicId: string;
      format: string;
      bytes: number;
    }
  | {
      ok: false;
      error: string;
      details?: any;
    }
> {
  /* -------------------------------------------------- */
  /* Validate input                                      */
  /* -------------------------------------------------- */
  if (!filePath || typeof filePath !== "string") {
    await emitSecurityEvent({
      type: "CLOUDINARY_UPLOAD_INVALID_PATH",
      message: "Invalid file path for Cloudinary upload",
      severity: "medium",
      context: "cloudinary",
      operation: "upload",
      category: "media",
      tags: ["cloudinary", "invalid_path"],
      metadata: { filePath },
      source: "cloudinary_api",
    });

    return { ok: false, error: "invalid_file_path" };
  }

  try {
    /* -------------------------------------------------- */
    /* Upload                                              */
    /* -------------------------------------------------- */
    const result: UploadApiResponse = await cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: "image",
        transformation: transformations,
      }
    );

    /* -------------------------------------------------- */
    /* Success event                                       */
    /* -------------------------------------------------- */
    await emitSecurityEvent({
      type: "CLOUDINARY_UPLOAD_SUCCESS",
      message: `Image uploaded: ${result.public_id}`,
      severity: "low",
      context: "cloudinary",
      operation: "upload",
      category: "media",
      tags: ["cloudinary", "upload_success"],
      metadata: {
        publicId: result.public_id,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        format: result.format,
      },
      source: "cloudinary_api",
    });

    return {
      ok: true,
      url: result.secure_url,
      width: result.width!,
      height: result.height!,
      publicId: result.public_id!,
      format: result.format!,
      bytes: result.bytes!,
    };
  } catch (err: any) {
    /* -------------------------------------------------- */
    /* Error event                                         */
    /* -------------------------------------------------- */
    await emitSecurityEvent({
      type: "CLOUDINARY_UPLOAD_ERROR",
      message: "Cloudinary upload failed",
      severity: "high",
      context: "cloudinary",
      operation: "upload",
      category: "media",
      tags: ["cloudinary", "upload_error"],
      metadata: { error: err?.message, filePath },
      source: "cloudinary_api",
    });

    await emitAlertEvent({
      type: "CLOUDINARY_UPLOAD_FAILURE",
      metadata: { error: err?.message, filePath },
    });

    return { ok: false, error: "upload_failed", details: err?.message };
  }
}
