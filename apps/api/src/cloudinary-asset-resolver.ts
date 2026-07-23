import { cloudinary } from "./cloudinary.js";
import { env } from "./env.js";
import { ApiError } from "./errors.js";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, isAllowedVideoFormat } from "./media-validation.js";

export type CloudinarySourceInput = {
  sourceKind: "URL" | "PUBLIC_ID";
  source: string;
  resourceType: "auto" | "image" | "video";
};
export type ResolvedCloudinaryAsset = {
  assetId: string | null;
  publicId: string;
  version: number | null;
  resourceType: "image" | "video";
  secureUrl: string;
  thumbnailUrl: string;
  format: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  bytes: number | null;
  originalFilename: string | null;
};

type ParsedSource = { publicId: string; resourceType: "image" | "video"; version: number | null };

const allowedImageFormats = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
const simpleOptionSegments = new Set(["fl_attachment"]);

function stripExtension(segments: string[]) {
  const last = segments.at(-1);
  if (!last)
    throw new ApiError(400, "Cloudinary URL ne sadrži Public ID.", "CLOUDINARY_PUBLIC_ID_MISSING");
  const withoutExt = last.replace(/\.[^.\/]+$/, "");
  if (!withoutExt || withoutExt === "." || withoutExt === "..")
    throw new ApiError(400, "Cloudinary URL ne sadrži Public ID.", "CLOUDINARY_PUBLIC_ID_MISSING");
  return [...segments.slice(0, -1), withoutExt].join("/");
}

function assertSafePublicId(publicId: string) {
  if (!publicId || publicId.includes("..") || publicId.startsWith("/") || publicId.endsWith("/"))
    throw new ApiError(400, "Cloudinary Public ID nije ispravan.", "INVALID_CLOUDINARY_PUBLIC_ID");
}

export function parseCloudinarySource(input: CloudinarySourceInput): ParsedSource {
  if (input.sourceKind === "PUBLIC_ID") {
    const publicId = input.source.trim().replace(/\.[^.\/]+$/, "");
    assertSafePublicId(publicId);
    if (input.resourceType === "auto")
      throw new ApiError(
        400,
        "Za Public ID izaberite da li je asset slika ili video.",
        "CLOUDINARY_RESOURCE_TYPE_REQUIRED",
      );
    return { publicId, resourceType: input.resourceType, version: null };
  }
  let url: URL;
  try {
    url = new URL(input.source);
  } catch {
    throw new ApiError(400, "Cloudinary URL nije ispravan.", "INVALID_CLOUDINARY_URL");
  }
  if (url.protocol !== "https:")
    throw new ApiError(400, "Cloudinary URL mora koristiti HTTPS.", "CLOUDINARY_HTTPS_REQUIRED");
  if (url.hostname !== "res.cloudinary.com")
    throw new ApiError(
      400,
      "Dozvoljen je samo res.cloudinary.com Cloudinary domen.",
      "CLOUDINARY_HOST_NOT_ALLOWED",
    );
  const [cloudName, resourceType, deliveryType, ...rest] = url.pathname.split("/").filter(Boolean);
  if (cloudName !== env.cloudinary.cloudName)
    throw new ApiError(
      400,
      "Cloudinary URL ne pripada Forest Glade Cloudinary nalogu.",
      "CLOUDINARY_CLOUD_MISMATCH",
    );
  if (resourceType !== "image" && resourceType !== "video")
    throw new ApiError(
      400,
      "Cloudinary resource type mora biti image ili video.",
      "INVALID_CLOUDINARY_RESOURCE_TYPE",
    );
  if (input.resourceType !== "auto" && input.resourceType !== resourceType)
    throw new ApiError(
      400,
      "Izabrani resource type ne odgovara Cloudinary URL-u.",
      "CLOUDINARY_RESOURCE_TYPE_MISMATCH",
    );
  if (deliveryType !== "upload")
    throw new ApiError(
      400,
      "Dozvoljen je samo Cloudinary upload delivery type.",
      "CLOUDINARY_DELIVERY_TYPE_NOT_ALLOWED",
    );
  const versionIndex = rest.findIndex((segment) => /^v\d+$/.test(segment));
  let publicIdSegments: string[];
  let version: number | null = null;
  if (versionIndex >= 0) {
    version = Number(rest[versionIndex].slice(1));
    publicIdSegments = rest.slice(versionIndex + 1);
  } else {
    if (
      rest.length > 1 &&
      rest
        .slice(0, -1)
        .some(
          (segment) =>
            segment.includes(",") || segment.includes("_") || !simpleOptionSegments.has(segment),
        )
    )
      throw new ApiError(
        400,
        "URL bez version segmenta je nejasan; unesite Cloudinary Public ID.",
        "CLOUDINARY_PUBLIC_ID_REQUIRED",
      );
    publicIdSegments = rest.filter((segment) => !simpleOptionSegments.has(segment));
  }
  const publicId = stripExtension(publicIdSegments);
  assertSafePublicId(publicId);
  return { publicId, resourceType, version };
}

export async function resolveCloudinaryAsset(
  input: CloudinarySourceInput,
): Promise<ResolvedCloudinaryAsset> {
  const parsed = parseCloudinarySource(input);
  const resource = await cloudinary.api
    .resource(parsed.publicId, { resource_type: parsed.resourceType, type: "upload" })
    .catch(() => {
      throw new ApiError(404, "Cloudinary asset nije pronađen.", "CLOUDINARY_ASSET_NOT_FOUND");
    });
  const publicId = String(resource.public_id ?? "");
  assertSafePublicId(publicId);
  if (!publicId.startsWith(`${env.cloudinary.folder}/`))
    throw new ApiError(
      400,
      "Cloudinary asset nije unutar Forest Glade projekta.",
      "CLOUDINARY_ASSET_OUTSIDE_PROJECT_ROOT",
    );
  if (
    resource.resource_type !== parsed.resourceType ||
    resource.type !== "upload" ||
    !resource.secure_url
  )
    throw new ApiError(
      400,
      "Cloudinary asset nije podržan upload asset.",
      "INVALID_CLOUDINARY_ASSET",
    );
  const format = resource.format ? String(resource.format).toLowerCase() : null;
  const bytes = Number.isFinite(Number(resource.bytes)) ? Number(resource.bytes) : null;
  if (
    parsed.resourceType === "image" &&
    (!format || !allowedImageFormats.has(format) || (bytes ?? 0) > MAX_IMAGE_BYTES)
  )
    throw new ApiError(
      400,
      "Slika mora biti JPG, PNG, WEBP ili AVIF i do 15 MB.",
      "INVALID_MEDIA_FORMAT",
    );
  if (
    parsed.resourceType === "video" &&
    (!isAllowedVideoFormat(format) || (bytes ?? 0) > MAX_VIDEO_BYTES)
  )
    throw new ApiError(400, "Video mora biti MP4, WEBM ili MOV i do 500 MB.", "INVALID_VIDEO");
  const thumbnailUrl =
    parsed.resourceType === "image"
      ? cloudinary.url(publicId, {
          secure: true,
          resource_type: "image",
          width: 800,
          height: 800,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        })
      : cloudinary.url(publicId, {
          secure: true,
          resource_type: "video",
          format: "jpg",
          start_offset: "0",
          width: 800,
          height: 450,
          crop: "limit",
          quality: "auto",
        });
  return {
    assetId: resource.asset_id ?? null,
    publicId,
    version: typeof resource.version === "number" ? resource.version : parsed.version,
    resourceType: parsed.resourceType,
    secureUrl: String(resource.secure_url),
    thumbnailUrl,
    format,
    width: resource.width ?? null,
    height: resource.height ?? null,
    durationSeconds: typeof resource.duration === "number" ? Math.round(resource.duration) : null,
    bytes,
    originalFilename: resource.original_filename ?? null,
  };
}
