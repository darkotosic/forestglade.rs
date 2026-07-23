"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { MediaAssetDto } from "@/lib/types";
export function ImageLightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: MediaAssetDto[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "Tab") {
        const controls = Array.from(
          document.querySelectorAll<HTMLElement>("[data-lightbox-control]"),
        );
        const first = controls[0],
          last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", key);
    };
  }, [index, items.length, onClose, onIndex]);
  const item = items[index];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pregled galerije"
      className="fixed inset-0 z-50 grid bg-black/90 p-3 text-white"
    >
      <button
        data-lightbox-control
        ref={closeRef}
        aria-label="Zatvori galeriju"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-3"
      >
        Zatvori
      </button>
      <button
        data-lightbox-control
        aria-label="Prethodna slika"
        onClick={() => onIndex((index - 1 + items.length) % items.length)}
        className="absolute left-3 top-1/2 z-10 p-4"
      >
        ←
      </button>
      <div className="grid min-h-0 place-items-center">
        <Image
          unoptimized
          src={item.secureUrl}
          alt={item.alt ?? item.title}
          width={1600}
          height={1200}
          className="max-h-[82vh] w-auto max-w-full object-contain"
          priority
        />
      </div>
      <button
        data-lightbox-control
        aria-label="Sledeća slika"
        onClick={() => onIndex((index + 1) % items.length)}
        className="absolute right-3 top-1/2 z-10 p-4"
      >
        →
      </button>
      <p className="self-end text-center">
        {item.caption ?? item.title} · {index + 1} / {items.length}
      </p>
    </div>
  );
}
