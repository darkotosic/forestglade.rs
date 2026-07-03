import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactCta } from "@/components/site-shell";
import { PublicApartmentMedia, PublicApartmentStatus } from "@/components/public/public-live";
import { apartments, getApartment } from "@/data/apartments";

export function generateStaticParams() { return apartments.map((apartment) => ({ slug: apartment.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const apartment = getApartment(slug);
  return { title: apartment ? `Apartman ${apartment.code}` : "Apartman", description: apartment ? `${apartment.code}, ${apartment.floor}, Forest Glade Vrdnik.` : undefined };
}

export default async function ApartmentDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const apartment = getApartment(slug);
  if (!apartment) notFound();
  return <main><section className="bg-forest-950 text-white"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><p className="text-sm uppercase tracking-[0.35em] text-gold-200">{apartment.floor}</p><h1 className="mt-4 text-6xl font-semibold">Apartman {apartment.code}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-stone-200">SEO stranica za apartman {apartment.code} u okviru Forest Glade apart-hotela. Detaljne dimenzije i osnove prikazuju se iz zvanične dokumentacije.</p></div></section><section className="mx-auto grid max-w-7xl gap-6 px-5 py-16 md:grid-cols-3 lg:px-8">{[["Tip",apartment.type],["Površina",`${apartment.marketArea.toFixed(2)} m²`],["Status",<PublicApartmentStatus key="status" slug={apartment.slug} />],["Lokacija","Velika Međa bb, Vrdnik"],["Objekat","Apart Hotel"],["Šifra",apartment.code]].map(([k,v])=><div key={String(k)} className="rounded-3xl bg-white p-6 shadow-sm"><p className="text-sm uppercase tracking-[0.25em] text-forest-700">{k}</p><p className="mt-3 text-2xl font-semibold text-forest-950">{v}</p></div>)}</section><PublicApartmentMedia slug={apartment.slug} /><ContactCta /></main>;
}
