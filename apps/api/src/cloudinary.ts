import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env } from "./env.js";

cloudinary.config({ cloud_name: env.cloudinary.cloudName, api_key: env.cloudinary.apiKey, api_secret: env.cloudinary.apiSecret });

export function uploadBuffer(buffer: Buffer, folder: string, resourceType: "image" | "video" | "raw" = "image") {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (error, result) => error || !result ? reject(error) : resolve(result));
    stream.end(buffer);
  });
}

export function getCloudinaryThumbnailUrl(publicId: string, resourceType: "image" | "video" | "raw"): string {
  if (resourceType !== "image") return cloudinary.url(publicId, { secure: true, resource_type: resourceType });
  return cloudinary.url(publicId, { secure: true, resource_type: "image", width: 640, height: 640, crop: "limit", quality: "auto", fetch_format: "auto" });
}

export function getMediaFolder({ apartmentSlug, placement }: { apartmentSlug?: string | null; placement: string }): string {
  const root = env.cloudinary.folder.replace(/\/$/, "");
  if (apartmentSlug) return `${root}/apartments/${apartmentSlug.toLowerCase()}`;
  const folders: Record<string, string> = {
    HOME_HERO: "home", PROJECT_GALLERY: "project-gallery", EXTERIOR: "exterior", INTERIOR: "interior",
    VIRTUAL_TOUR: "virtual-tours", DOCUMENTATION: "documents", FLOOR_PLAN: "documents", APARTMENT_PLAN: "documents",
  };
  return `${root}/${folders[placement] ?? "project-gallery"}`;
}
export { cloudinary };
