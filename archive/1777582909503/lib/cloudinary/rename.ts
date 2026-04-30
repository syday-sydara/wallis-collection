import { cloudinary } from ".";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

export async function renameImage(oldPublicId: string, newPublicId: string) {
  if (!oldPublicId || !newPublicId) {
    await emitSecurityEvent({
      type: "CLOUDINARY_RENAME_INVALID_INPUT",
      message: "Missing oldPublicId or newPublicId for Cloudinary rename",
      severity: "medium",
      context: "cloudinary",
      operation: "rename",
      category: "media",
      tags: ["cloudinary", "rename_invalid"],
      metadata: { oldPublicId, newPublicId },
      source: "cloudinary_api",
    });

    return { ok: false, error: "missing_public_id" };
  }

  try {
    const result = await cloudinary.uploader.rename(oldPublicId, newPublicId);

    // Cloudinary returns { result: "not found" } if oldPublicId doesn't exist
    if (result.result === "not found") {
      await emitSecurityEvent({
        type: "CLOUDINARY_RENAME_NOT_FOUND",
        message: `Cloudinary image not found: ${oldPublicId}`,
        severity: "low",
        context: "cloudinary",
        operation: "rename",
        category: "media",
        tags: ["cloudinary", "rename_not_found"],
        metadata: { oldPublicId, newPublicId },
        source: "cloudinary_api",
      });

      return { ok: false, error: "not_found" };
    }

    await emitSecurityEvent({
      type: "CLOUDINARY_RENAME_SUCCESS",
      message: `Cloudinary image renamed: ${oldPublicId} → ${newPublicId}`,
      severity: "low",
      context: "cloudinary",
      operation: "rename",
      category: "media",
      tags: ["cloudinary", "rename_success"],
      metadata: { oldPublicId, newPublicId },
      source: "cloudinary_api",
    });

    return { ok: true, result };
  } catch (err: any) {
    await emitSecurityEvent({
      type: "CLOUDINARY_RENAME_ERROR",
      message: `Cloudinary rename failed for ${oldPublicId}`,
      severity: "high",
      context: "cloudinary",
      operation: "rename",
      category: "media",
      tags: ["cloudinary", "rename_error"],
      metadata: { oldPublicId, newPublicId, error: err?.message },
      source: "cloudinary_api",
    });

    await emitAlertEvent({
      type: "CLOUDINARY_RENAME_FAILURE",
      metadata: { oldPublicId, newPublicId, error: err?.message },
    });

    return { ok: false, error: "rename_failed" };
  }
}
