import { cloudinary } from "./config";

export async function uploadImageFromFormData(
  file: File
): Promise<{
  url: string;
  width: number;
  height: number;
  publicId: string;
  format: string;
  bytes: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "wallis",
        resource_type: "image",
        transformation: [
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve({
            url: result!.secure_url,
            width: result!.width!,
            height: result!.height!,
            publicId: result!.public_id!,
            format: result!.format!,
            bytes: result!.bytes!,
          });
        }
      }
    );

    stream.end(buffer);
  });
}
