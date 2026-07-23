"use client";
import { useState } from "react";
import { adminFetch } from "@/lib/admin-api";
import type { MediaPlacement } from "@/lib/types";
const options: [MediaPlacement, string][] = [
  ["APARTMENT_CATALOG", "Kataloška strana"],
  ["APARTMENT_GALLERY", "Galerija apartmana"],
  ["APARTMENT_PLAN", "Osnova apartmana"],
  ["INTERIOR", "Enterijer"],
  ["VIRTUAL_TOUR", "Virtuelna šetnja"],
];
export function ApartmentImageUpload({
  slug,
  code,
  hasCover,
  onUploaded,
  readOnly = false,
}: {
  slug: string;
  code: string;
  hasCover: boolean;
  onUploaded: () => void;
  readOnly?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [placement, setPlacement] = useState<MediaPlacement>("APARTMENT_CATALOG");
  const [title, setTitle] = useState(`Apartman ${code} – prodajni katalog`);
  const [alt, setAlt] = useState(
    `Kataloški prikaz apartmana ${code} u objektu Forest Glade, Vrdnik`,
  );
  const [caption, setCaption] = useState("");
  const [published, setPublished] = useState(true);
  const [cover, setCover] = useState(!hasCover);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function upload() {
    if (!file) return setMessage("Izaberite sliku.");
    setBusy(true);
    setMessage("");
    const data = new FormData();
    for (const [k, v] of Object.entries({
      title,
      alt,
      caption,
      placement,
      type: placement === "APARTMENT_PLAN" ? "FLOOR_PLAN" : "IMAGE",
      isPublished: published,
      isCover: cover,
    }))
      data.set(k, String(v));
    data.set("file", file);
    try {
      await adminFetch(`/apartments/${slug}/media/upload`, { method: "POST", body: data });
      setFile(null);
      setMessage("Slika je uspešno uploadovana.");
      onUploaded();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload nije uspeo.");
    } finally {
      setBusy(false);
    }
  }
  if (readOnly)
    return <p className="rounded-xl bg-stone-100 p-4">Imate read-only pristup slikama.</p>;
  return (
    <div className="grid gap-4 rounded-2xl border p-5">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setFile(e.dataTransfer.files[0] ?? null);
        }}
        className="grid min-h-32 cursor-pointer place-items-center rounded-xl border-2 border-dashed p-5 text-center"
      >
        <span>
          {file?.name ?? "Prevucite sliku ovde ili izaberite fajl (JPG, PNG, WEBP, AVIF; do 15 MB)"}
        </span>
        <input
          className="mt-3"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <label>
        Vrsta prikaza
        <select
          className="mt-1 w-full rounded-xl border p-3"
          value={placement}
          onChange={(e) => setPlacement(e.target.value as MediaPlacement)}
        >
          {options.map(([v, l]) => (
            <option value={v} key={v}>
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
      <label>
        Alt tekst
        <input
          className="mt-1 w-full rounded-xl border p-3"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
        />
      </label>
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
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />{" "}
          Objavi odmah
        </label>
        <label>
          <input type="checkbox" checked={cover} onChange={(e) => setCover(e.target.checked)} />{" "}
          Postavi kao naslovnu sliku
        </label>
      </div>
      <button
        disabled={busy}
        onClick={upload}
        className="rounded-xl bg-forest-900 p-3 text-white disabled:opacity-50"
      >
        {busy ? "Upload..." : "Uploaduj sliku"}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
