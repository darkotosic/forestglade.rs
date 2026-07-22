import { fileTypeFromBuffer } from "file-type";
import { ApiError } from "./errors.js";

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export function isAllowedImageMime(mime: string | null | undefined) {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mime as AllowedImageMime);
}

export function isAllowedVideoFormat(format: string | null | undefined) {
  return ["mp4", "webm", "mov", "quicktime"].includes(String(format ?? "").toLowerCase());
}

export async function validateImageFile(file: Pick<Express.Multer.File, "buffer" | "mimetype" | "size">): Promise<{ mime: AllowedImageMime; ext: "jpg" | "png" | "webp" | "avif" }> {
  if (file.size > MAX_IMAGE_BYTES) throw new ApiError(400, "Slika ne sme biti veća od 15 MB.", "IMAGE_TOO_LARGE");
  if (!isAllowedImageMime(file.mimetype)) throw new ApiError(400, "Dozvoljeni formati su JPG, PNG, WEBP, AVIF, MP4, WEBM i MOV.", "IMAGE_FORMAT_NOT_ALLOWED");
  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !isAllowedImageMime(detected.mime)) throw new ApiError(400, "Dozvoljeni formati su JPG, PNG, WEBP, AVIF, MP4, WEBM i MOV.", "IMAGE_FORMAT_NOT_ALLOWED");
  if (detected.mime !== file.mimetype) throw new ApiError(400, "Sadržaj fajla ne odgovara prijavljenom formatu.", "IMAGE_MIME_MISMATCH");
  const ext = detected.ext === "jpeg" ? "jpg" : detected.ext;
  return { mime: detected.mime as AllowedImageMime, ext: ext as "jpg" | "png" | "webp" | "avif" };
}
