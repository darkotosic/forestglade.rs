"use client";
import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin-api";
import { uploadToCloudinaryWithChunks } from "@/lib/cloudinary-chunked-upload";
import type { MediaPlacement, MediaType } from "@/lib/types";
const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];
const maxImage = 15 * 1024 * 1024,
  maxVideo = 500 * 1024 * 1024;
const placementOptions = [
  ["APARTMENT_CATALOG", "Kataloški prikaz"],
  ["APARTMENT_GALLERY", "Galerija apartmana"],
  ["APARTMENT_PLAN", "Osnova apartmana"],
  ["INTERIOR", "Enterijer"],
  ["VIRTUAL_TOUR", "Virtuelna šetnja"],
] as const;
const typeOptions = [
  ["IMAGE", "Fotografija"],
  ["RENDER", "3D render"],
  ["FLOOR_PLAN", "Osnova apartmana"],
  ["VIDEO", "Video"],
  ["VIRTUAL_TOUR", "Virtuelna šetnja"],
] as const;
type Props = {
  apartmentCode: string;
  apartmentSlug: string;
  apartmentArea: string;
  onUploaded: () => Promise<void> | void;
  hasCover: boolean;
  readOnly?: boolean;
};
export function ApartmentMediaUpload({
  apartmentCode,
  apartmentSlug,
  apartmentArea,
  onUploaded,
  hasCover,
  readOnly = false,
}: Props) {
  const [tab, setTab] = useState<"file" | "cloudinary">("file");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(`Apartman ${apartmentCode} – fotografija`);
  const [alt, setAlt] = useState(
    `Kataloški prikaz apartmana ${apartmentCode} površine ${apartmentArea} m² u objektu Forest Glade u Vrdniku`,
  );
  const [caption, setCaption] = useState("");
  const [type, setType] = useState<MediaType>("IMAGE");
  const [placement, setPlacement] = useState<MediaPlacement>("APARTMENT_GALLERY");
  const [isPublished, setPublished] = useState(true);
  const [isCover, setCover] = useState(!hasCover);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  type ResolvedAsset = {
    assetId: string | null;
    publicId: string;
    resourceType: "image" | "video";
    secureUrl: string;
    thumbnailUrl: string;
    format: string | null;
    width: number | null;
    height: number | null;
    durationSeconds: number | null;
    bytes: number | null;
  };
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sourceKind, setSourceKind] = useState<"URL" | "PUBLIC_ID">("URL");
  const [source, setSource] = useState("");
  const [resourceType, setResourceType] = useState<"auto" | "image" | "video">("auto");
  const [asset, setAsset] = useState<ResolvedAsset | null>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  function choose(next: File | null) {
    setFile(next);
    setError("");
    setSuccess("");
    if (!next) return;
    const isVideo = next.type.startsWith("video/");
    setType(isVideo ? "VIDEO" : "IMAGE");
    setPlacement(isVideo ? "VIRTUAL_TOUR" : "APARTMENT_GALLERY");
    setTitle(
      next.name.toLowerCase() === "stan 01.jpg"
        ? `Apartman ${apartmentCode} – prodajni katalog`
        : isVideo
          ? `Apartman ${apartmentCode} – video prezentacija`
          : `Apartman ${apartmentCode} – fotografija`,
    );
    setCover(!hasCover && !isVideo);
  }
  function validate() {
    if (!file) return "Izaberite sliku ili video.";
    if (![...imageTypes, ...videoTypes].includes(file.type))
      return "Dozvoljeni formati su JPG, PNG, WEBP, AVIF, MP4, WEBM i MOV.";
    if (imageTypes.includes(file.type) && file.size > maxImage)
      return "Slika ne sme biti veća od 15 MB.";
    if (videoTypes.includes(file.type) && file.size > maxVideo)
      return "Video ne sme biti veći od 500 MB.";
    if (imageTypes.includes(file.type) && isPublished && !alt.trim())
      return "Alt tekst je obavezan za objavljenu sliku.";
    return "";
  }
  async function handleUpload() {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    setProgress(0);
    try {
      const resourceType = file.type.startsWith("video/") ? "video" : "image";
      const signed = await adminFetch<{
        ok: true;
        upload: {
          cloudName: string;
          apiKey: string;
          timestamp: number;
          signature: string;
          folder: string;
          resourceType: "image" | "video";
          uploadPreset: string;
        };
      }>(`/apartments/${apartmentSlug}/media/sign`, {
        method: "POST",
        body: JSON.stringify({ resourceType }),
      });
      const uploaded = await uploadToCloudinaryWithChunks({
        file,
        ...signed.upload,
        onProgress: setProgress,
      });
      await adminFetch(`/apartments/${apartmentSlug}/media/complete`, {
        method: "POST",
        body: JSON.stringify({
          publicId: uploaded.public_id,
          version: uploaded.version,
          signature: uploaded.signature,
          resourceType,
          originalFilename: file.name,
          title,
          alt: resourceType === "image" ? alt : null,
          caption,
          type,
          placement,
          isPublished,
          isCover: resourceType === "image" ? isCover : false,
        }),
      });
      setSuccess("Fajl je uspešno otpremljen.");
      choose(null);
      await onUploaded();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload nije uspeo.");
    } finally {
      setUploading(false);
    }
  }
  async function resolveImport() {
    setError("");
    setSuccess("");
    const result = await adminFetch<{ ok: true; asset: ResolvedAsset }>(
      `/apartments/${apartmentSlug}/media/resolve-cloudinary`,
      { method: "POST", body: JSON.stringify({ sourceKind, source, resourceType }) },
    );
    setAsset(result.asset);
    if (result.asset.resourceType === "video") {
      setType("VIDEO");
      setPlacement("VIRTUAL_TOUR");
      setCover(false);
      setAlt("");
    } else {
      setType("IMAGE");
      setPlacement("APARTMENT_GALLERY");
    }
  }
  async function importAsset() {
    if (!asset) return;
    setUploading(true);
    setError("");
    try {
      await adminFetch(`/apartments/${apartmentSlug}/media/import-cloudinary`, {
        method: "POST",
        body: JSON.stringify({
          sourceKind,
          source,
          resourceType,
          title,
          alt: asset.resourceType === "image" ? alt : null,
          caption,
          type,
          placement,
          isPublished,
          isCover: asset.resourceType === "image" ? isCover : false,
        }),
      });
      setSuccess("Cloudinary asset je dodat u apartman.");
      setAsset(null);
      setSource("");
      await onUploaded();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import nije uspeo.");
    } finally {
      setUploading(false);
    }
  }
  if (readOnly)
    return (
      <p className="rounded-xl bg-stone-100 p-4">Vaša uloga ima pristup samo za pregled medija.</p>
    );
  const isVideo = file?.type.startsWith("video/");
  return (
    <div className="grid gap-4 rounded-2xl border p-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("file")}
          className={
            tab === "file"
              ? "rounded-xl bg-forest-900 px-4 py-2 text-white"
              : "rounded-xl border px-4 py-2"
          }
        >
          Otpremi fajl
        </button>
        <button
          type="button"
          onClick={() => setTab("cloudinary")}
          className={
            tab === "cloudinary"
              ? "rounded-xl bg-forest-900 px-4 py-2 text-white"
              : "rounded-xl border px-4 py-2"
          }
        >
          Dodaj iz Cloudinary-ja
        </button>
      </div>
      {tab === "cloudinary" && (
        <div className="grid gap-3 rounded-xl bg-stone-50 p-4">
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                checked={sourceKind === "URL"}
                onChange={() => setSourceKind("URL")}
              />{" "}
              Cloudinary URL
            </label>
            <label>
              <input
                type="radio"
                checked={sourceKind === "PUBLIC_ID"}
                onChange={() => setSourceKind("PUBLIC_ID")}
              />{" "}
              Cloudinary Public ID
            </label>
          </div>
          <input
            className="rounded-xl border p-3"
            placeholder={
              sourceKind === "URL"
                ? "https://res.cloudinary.com/..."
                : "forestglade/apartments/a1/render"
            }
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <select
            className="rounded-xl border p-3"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value as never)}
          >
            <option value="auto">Auto</option>
            <option value="image">Slika</option>
            <option value="video">Video</option>
          </select>
          <button
            type="button"
            onClick={() => void resolveImport()}
            className="rounded-xl bg-forest-800 p-3 text-white"
          >
            Proveri URL
          </button>
          {asset && (
            <div className="grid gap-2">
              <p>Public ID: {asset.publicId}</p>
              <p>
                Format: {asset.format} · {asset.width}×{asset.height} ·{" "}
                {asset.bytes ? `${(asset.bytes / 1024 / 1024).toFixed(2)} MB` : "—"} · Trajanje:{" "}
                {asset.durationSeconds ?? "—"}
              </p>
              <p className="break-all">Canonical secure URL: {asset.secureUrl}</p>
              {asset.resourceType === "video" ? (
                <video
                  src={asset.secureUrl}
                  poster={asset.thumbnailUrl}
                  controls
                  preload="metadata"
                  className="max-h-80 rounded-xl bg-black"
                />
              ) : (
                <img
                  src={asset.thumbnailUrl}
                  alt="Cloudinary preview"
                  className="max-h-80 rounded-xl object-contain"
                />
              )}
              <button
                type="button"
                disabled={uploading}
                onClick={() => void importAsset()}
                className="rounded-xl bg-forest-900 p-3 text-white disabled:opacity-50"
              >
                Dodaj u apartman
              </button>
            </div>
          )}
        </div>
      )}
      {tab === "file" && (
        <>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              choose(e.dataTransfer.files[0] ?? null);
            }}
            className="grid min-h-32 cursor-pointer place-items-center rounded-xl border-2 border-dashed p-5 text-center"
          >
            <span>
              {file?.name ?? "Izaberite ili prevucite fajl (JPG, PNG, WEBP, AVIF, MP4, WEBM, MOV)"}
            </span>
            <input
              className="mt-3"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
              onChange={(e) => choose(e.target.files?.[0] ?? null)}
            />
          </label>
          {preview &&
            (isVideo ? (
              <video src={preview} controls className="max-h-80 rounded-xl bg-black" />
            ) : (
              <img src={preview} alt="Preview" className="max-h-80 rounded-xl object-contain" />
            ))}
          <label>
            Tip
            <select
              className="mt-1 w-full rounded-xl border p-3"
              value={type}
              onChange={(e) => setType(e.target.value as MediaType)}
            >
              {[
                ["IMAGE", "Fotografija"],
                ["RENDER", "Render"],
                ["FLOOR_PLAN", "Osnova apartmana"],
                ["VIDEO", "Video"],
                ["VIRTUAL_TOUR", "Virtuelna šetnja"],
              ].map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            Placement
            <select
              className="mt-1 w-full rounded-xl border p-3"
              value={placement}
              onChange={(e) => setPlacement(e.target.value as MediaPlacement)}
            >
              {["APARTMENT_GALLERY", "APARTMENT_PLAN", "INTERIOR", "VIRTUAL_TOUR"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Naslov
            <input
              className="mt-1 w-full rounded-xl border p-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          {!isVideo && (
            <label>
              Alt tekst
              <input
                className="mt-1 w-full rounded-xl border p-3"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
              />
            </label>
          )}
          <label>
            Opis
            <textarea
              className="mt-1 w-full rounded-xl border p-3"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-5">
            <label>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setPublished(e.target.checked)}
              />{" "}
              Objavljeno
            </label>
            {!isVideo && (
              <label>
                <input
                  type="checkbox"
                  checked={isCover}
                  onChange={(e) => setCover(e.target.checked)}
                />{" "}
                Naslovna slika
              </label>
            )}
          </div>
          {uploading && (
            <div>
              <div className="h-3 rounded-full bg-stone-200">
                <div className="h-3 rounded-full bg-forest-800" style={{ width: `${progress}%` }} />
              </div>
              <p>Progres: {progress}%</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !file}
            className="rounded-xl bg-forest-900 p-3 text-white disabled:opacity-50"
          >
            {uploading ? `Otpremanje ${progress}%` : "Otpremi fajl"}
          </button>
          {error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
          {success && <p className="rounded-xl bg-green-50 p-3 text-green-700">{success}</p>}
        </>
      )}
      <div className="grid gap-3">
        <label>
          Tip
          <select
            className="mt-1 w-full rounded-xl border p-3"
            value={type}
            onChange={(e) => setType(e.target.value as MediaType)}
          >
            {typeOptions.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          Placement
          <select
            className="mt-1 w-full rounded-xl border p-3"
            value={placement}
            onChange={(e) => setPlacement(e.target.value as MediaPlacement)}
          >
            {placementOptions.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          Naslov
          <input
            className="mt-1 w-full rounded-xl border p-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        {!(asset?.resourceType === "video") && (
          <label>
            Alt tekst
            <input
              className="mt-1 w-full rounded-xl border p-3"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
          </label>
        )}
        <label>
          Opis
          <textarea
            className="mt-1 w-full rounded-xl border p-3"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-5">
          <label>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setPublished(e.target.checked)}
            />{" "}
            Objavljeno
          </label>
          {!(asset?.resourceType === "video") && (
            <label>
              <input
                type="checkbox"
                checked={isCover}
                onChange={(e) => setCover(e.target.checked)}
              />{" "}
              Naslovna slika
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
