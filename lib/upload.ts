import { uploadImageFromFormData } from "./cloudinary/upload-formdata";

export async function uploadToCloud(file: File | string): Promise<string> {
  if (typeof file === "string") {
    // Handle URL uploads if needed
    throw new Error("URL uploads not implemented");
  }

  return uploadImageFromFormData(file);
}