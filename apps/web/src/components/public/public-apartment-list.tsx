"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { apartments as officialApartments } from "@/data/apartments";
import { apiPath } from "@/lib/api";
import { AnimatedNumber } from "@/components/animated-number";

const statusLabels: Record<string, string> = { AVAILABLE: "Slobodan", RESERVED: "Rezervisan", SOLD: "Prodat", HIDDEN: "Sakriven" };

type LiveApartment = {
  code: string;
  slug: string;
  floor: string;
  officialType: string;
  marketArea: string;
  status: string;
  price?: string | null;
  priceNote?: string | null;
  shortDescription?: string | null;
};

export function PublicApartmentList() {
  const [live, setLive] = useState<LiveApartment[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(apiPath("/public/apartments"))
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("API unavailable")))
      .then((data) => setLive(data.apartments ?? []))
      .catch(() => setFailed(true));
  }, []);

  const merged = useMemo(() => officialApartments.map((official) => {
    const item = live?.find((candidate) => candidate.slug === official.slug);
    return {
      ...official,
      officialType: item?.officialType ?? official.officialType,
      status: item?.status ?? "POTREBNA_PROVERA",
      price: item?.price,
      priceNote: item?.priceNote,
      shortDescription: item?.shortDescription,
      hidden: item?.status === "HIDDEN",
    };
  }).filter((apartment) => !apartment.hidden), [live]);

  return <>
    {failed ? <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Dostupnost: POTREBNA PROVERA</p> : null}
    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {merged.map((apartment) => <Link href={`/apartmani/${apartment.slug}`} className="group rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl" key={apartment.slug}>
        <div className="flex items-start justify-between"><div><p className="text-sm uppercase tracking-[0.3em] text-forest-700">{apartment.floor}</p><h3 className="mt-2 text-3xl font-semibold text-forest-950"><AnimatedNumber value={apartment.code} /></h3></div><ArrowUpRight className="text-forest-700 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
        <div className="mt-8 grid grid-cols-3 gap-3 text-sm"><span><b>Tip</b><br />{apartment.officialType}</span><span><b>Površina</b><br /><AnimatedNumber value={`${apartment.marketArea.toFixed(2)} m²`} /></span><span><b>Status</b><br />{statusLabels[apartment.status] ?? "POTREBNA PROVERA"}</span></div>
        {apartment.price ? <p className="mt-4 rounded-xl bg-forest-50 p-3 text-sm font-semibold">Cena: <AnimatedNumber value={apartment.price} /></p> : <p className="mt-4 text-sm text-stone-500">Cena: POTREBNA PROVERA</p>}
        {apartment.shortDescription ? <p className="mt-3 text-sm text-stone-600">{apartment.shortDescription}</p> : null}
      </Link>)}
    </div>
  </>;
}
