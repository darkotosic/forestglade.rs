import {
  uploadDirectlyToCloudinary,
  type CloudinaryUploadResult,
} from "./cloudinary-direct-upload";

type Options = Parameters<typeof uploadDirectlyToCloudinary>[0] & {
  uploadPreset?: string;
  signal?: AbortSignal;
};
const threshold = 95 * 1024 * 1024;
const chunkSize = 8 * 1024 * 1024;

export async function uploadToCloudinaryWithChunks(
  options: Options,
): Promise<CloudinaryUploadResult> {
  if (options.file.size <= threshold) return uploadDirectlyToCloudinary(options);
  const uploadId = crypto.randomUUID();
  let lastResult: CloudinaryUploadResult | null = null;
  for (let start = 0; start < options.file.size; start += chunkSize) {
    if (options.signal?.aborted) throw new DOMException("Upload je otkazan.", "AbortError");
    const end = Math.min(start + chunkSize, options.file.size);
    const chunk = options.file.slice(start, end);
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        lastResult = await uploadChunk({ ...options, chunk, start, end, uploadId });
        break;
      } catch (error) {
        if (attempt === 3) throw error;
      }
    }
    options.onProgress?.(Math.round((end / options.file.size) * 100));
  }
  if (!lastResult) throw new Error("Cloudinary upload nije uspeo.");
  return lastResult;
}

function uploadChunk(
  options: Options & { chunk: Blob; start: number; end: number; uploadId: string },
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    options.signal?.addEventListener(
      "abort",
      () => {
        xhr.abort();
        reject(new DOMException("Upload je otkazan.", "AbortError"));
      },
      { once: true },
    );
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${options.cloudName}/${options.resourceType}/upload`,
    );
    xhr.setRequestHeader("X-Unique-Upload-Id", options.uploadId);
    xhr.setRequestHeader(
      "Content-Range",
      `bytes ${options.start}-${options.end - 1}/${options.file.size}`,
    );
    xhr.addEventListener("load", () => {
      const result = JSON.parse(xhr.responseText || "{}") as CloudinaryUploadResult & {
        error?: { message?: string };
      };
      if (xhr.status >= 200 && xhr.status < 300) resolve(result);
      else reject(new Error(result.error?.message ?? "Cloudinary upload nije uspeo."));
    });
    xhr.addEventListener("error", () =>
      reject(new Error("Mrežna greška tokom slanja dela fajla.")),
    );
    const formData = new FormData();
    formData.set("file", options.chunk);
    formData.set("api_key", options.apiKey);
    formData.set("timestamp", String(options.timestamp));
    formData.set("signature", options.signature);
    formData.set("folder", options.folder);
    if (options.uploadPreset) formData.set("upload_preset", options.uploadPreset);
    xhr.send(formData);
  });
}
