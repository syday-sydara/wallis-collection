// lib/cloudinary/signature.ts
import { cloudinary } from "@/lib/cloudinary/config";

export function generateUploadSignature(
  params: Record<string, string | number>
) {
  const timestamp = Math.floor(Date.now() / 1000);

  const payload = {
    ...params,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    payload,
    process.env.CLOUDINARY_API_SECRET!
  );

  return { signature, timestamp };
}
