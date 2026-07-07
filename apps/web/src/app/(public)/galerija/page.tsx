import type { Metadata } from "next";
import { GalleryLiveMedia } from "@/components/public/public-live";
import { ContactCta } from "@/components/site-shell";
export const metadata: Metadata = { title: "Galerija | Forest Glade", description: "Galerija projekta Forest Glade." };
export default function Page(){return <main><section className="bg-stone-100"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><p className="text-sm uppercase tracking-[0.35em] text-forest-700">Galerija</p><h1 className="mt-3 text-5xl font-semibold text-forest-950">Galerija projekta</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">Prikazuju se objavljeni PROJECT_GALLERY, EXTERIOR i INTERIOR materijali. Ako materijali nisu objavljeni: Galerija: POTREBNA PROVERA.</p></div></section><GalleryLiveMedia/><ContactCta /></main>}
