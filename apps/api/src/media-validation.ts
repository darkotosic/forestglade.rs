import { fileTypeFromBuffer } from "file-type";
import { ApiError } from "./errors.js";

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
type AllowedMime = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export async function validateImageFile(file: Pick<Express.Multer.File, "buffer" | "mimetype" | "size">): Promise<{ mime: AllowedMime; ext: "jpg" | "png" | "webp" | "avif" }> {
  if (file.size > MAX_IMAGE_BYTES) throw new ApiError(400, "Maksimalna veličina slike je 15 MB.", "IMAGE_TOO_LARGE");
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype as AllowedMime)) throw new ApiError(400, "Dozvoljeni formati su JPG, PNG, WEBP i AVIF.", "IMAGE_FORMAT_NOT_ALLOWED");
  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !ALLOWED_IMAGE_MIME_TYPES.includes(detected.mime as AllowedMime)) throw new ApiError(400, "Dozvoljeni formati su JPG, PNG, WEBP i AVIF.", "IMAGE_FORMAT_NOT_ALLOWED");
  if (detected.mime !== file.mimetype) throw new ApiError(400, "Sadržaj fajla ne odgovara prijavljenom formatu.", "IMAGE_MIME_MISMATCH");
  const ext = detected.ext === "jpeg" ? "jpg" : detected.ext;
  return { mime: detected.mime as AllowedMime, ext: ext as "jpg" | "png" | "webp" | "avif" };
}
