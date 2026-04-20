import { v2 as cloudinary } from "cloudinary";

export async function uploadImageFromFormData(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const upload = await cloudinary.uploader.upload_stream({
    folder: "products",
    resource_type: "image",
    transformation: [
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );

    stream.end(buffer);
  });
}
