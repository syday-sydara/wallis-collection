import { cloudinary } from ".";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

export async function deleteImage(publicId: string) {
  if (!publicId) {
    await emitSecurityEvent({
      type: "CLOUDINARY_DELETE_INVALID_ID",
      message: "Missing publicId for Cloudinary delete",
      severity: "medium",
      context: "cloudinary",
      operation: "delete",
      category: "media",
      tags: ["cloudinary", "delete_invalid"],
      metadata: {},
      source: "cloudinary_api",
    });

    return { ok: false, error: "missing_public_id" };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    // Cloudinary returns { result: "not found" } for missing images
    if (result.result === "not found") {
      await emitSecurityEvent({
        type: "CLOUDINARY_DELETE_NOT_FOUND",
        message: `Cloudinary image not found: ${publicId}`,
        severity: "low",
        context: "cloudinary",
        operation: "delete",
        category: "media",
        tags: ["cloudinary", "not_found"],
        metadata: { publicId },
        source: "cloudinary_api",
      });

      return { ok: false, error: "not_found" };
    }

    await emitSecurityEvent({
      type: "CLOUDINARY_DELETE_SUCCESS",
      message: `Cloudinary image deleted: ${publicId}`,
      severity: "low",
      context: "cloudinary",
      operation: "delete",
      category: "media",
      tags: ["cloudinary", "delete_success"],
      metadata: { publicId },
      source: "cloudinary_api",
    });

    return { ok: true, result };
  } catch (err: any) {
    await emitSecurityEvent({
      type: "CLOUDINARY_DELETE_ERROR",
      message: `Cloudinary delete failed for ${publicId}`,
      severity: "high",
      context: "cloudinary",
      operation: "delete",
      category: "media",
      tags: ["cloudinary", "delete_error"],
      metadata: { publicId, error: err?.message },
      source: "cloudinary_api",
    });

    await emitAlertEvent({
      type: "CLOUDINARY_DELETE_FAILURE",
      metadata: { publicId, error: err?.message },
    });

    return { ok: false, error: "delete_failed" };
  }
}
