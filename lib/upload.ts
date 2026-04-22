import { uploadImageFromFormData } from "./cloudinary/upload-formdata";

export async function uploadToCloud(file: File | string): Promise<string> {
  if (typeof file === "string") {
    throw new Error("URL uploads not implemented");
  }

  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file provided");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported file type");
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File exceeds 5MB limit");
  }

  try {
    return await uploadImageFromFormData(file);
  } catch (err) {
    console.error("Cloud upload failed:", err);
    throw new Error("Failed to upload image to cloud");
  }
}
