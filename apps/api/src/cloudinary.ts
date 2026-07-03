import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env } from "./env.js";

cloudinary.config({ cloud_name: env.cloudinary.cloudName, api_key: env.cloudinary.apiKey, api_secret: env.cloudinary.apiSecret });

export function uploadBuffer(buffer: Buffer, folder: string, resourceType: "image" | "video" | "raw" = "image") {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (error, result) => error || !result ? reject(error) : resolve(result));
    stream.end(buffer);
  });
}
export { cloudinary };
