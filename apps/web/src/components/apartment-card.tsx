import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Apartment } from "@/data/apartments";

export function ApartmentCard({ apartment }: { apartment: Apartment }) {
  return (
    <Link href={`/apartmani/${apartment.slug}`} className="group rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div><p className="text-sm uppercase tracking-[0.3em] text-forest-700">{apartment.floor}</p><h3 className="mt-2 text-3xl font-semibold text-forest-950">{apartment.code}</h3></div>
        <ArrowUpRight className="text-forest-700 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3 text-sm"><span><b>Tip</b><br />{apartment.type}</span><span><b>Površina</b><br />Po PDF-u</span><span><b>Status</b><br />Slobodan</span></div>
    </Link>
  );
}
