import Link from "next/link";
import { ArrowRight, Building2, MapPin, Trees } from "lucide-react";
import { ContactCta } from "@/components/site-shell";
import { apartments, projectFacts } from "@/data/apartments";

const stats = [["31", "apartman"], [projectFacts.grossArea, "bruto površina"], [projectFacts.marketArea, "tržišna površina"], ["Vrdnik", "Fruška Gora"]];

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden bg-forest-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,189,130,.28),transparent_30%),linear-gradient(120deg,rgba(11,31,24,.8),rgba(16,44,34,.95)),url('/renders/hero-placeholder.svg')] bg-cover bg-center" />
        <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-10 px-5 py-24 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <div><p className="mb-5 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-gold-200">{projectFacts.location}</p><h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">Premium apart-hotel prodajni centar u srcu Vrdnika.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-stone-200">Forest Glade predstavlja {projectFacts.category} sa {projectFacts.totalApartments} apartmanom, zamišljen kao savremena digitalna prezentacija za pregled, izbor i kontakt prodaje.</p><div className="mt-8 flex flex-col gap-4 sm:flex-row"><Link href="/apartmani" className="rounded-full bg-gold-200 px-7 py-4 font-semibold text-forest-950">Pogledajte apartmane</Link><Link href="/virtuelne-setnje" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 font-semibold">Virtuelne šetnje <ArrowRight size={18}/></Link></div></div>
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur"><div className="grid gap-4 sm:grid-cols-2">{stats.map(([value, label]) => <div key={label} className="rounded-3xl bg-white/10 p-5"><p className="text-3xl font-semibold text-gold-200">{value}</p><p className="mt-2 text-sm uppercase tracking-[0.25em] text-stone-300">{label}</p></div>)}</div></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-6 md:grid-cols-3">{[[Building2,"Apart Hotel",projectFacts.floors],[Trees,"Priroda i mir","Pozicioniranje uz ambijent Fruške Gore i banjskog Vrdnika."],[MapPin,"Velika Međa bb","Jasna lokacija za kupce iz Novog Sada, Beograda i regiona."]].map(([Icon,title,text]) => { const I=Icon as typeof Building2; return <article key={title as string} className="rounded-3xl bg-white p-8 shadow-sm"><I className="text-forest-700"/><h2 className="mt-5 text-2xl font-semibold text-forest-950">{title as string}</h2><p className="mt-3 leading-7 text-stone-600">{text as string}</p></article>;})}</div></section>
      <section className="bg-stone-100 py-20"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="flex items-end justify-between gap-6"><div><p className="text-sm uppercase tracking-[0.35em] text-forest-700">Izbor apartmana</p><h2 className="mt-3 text-4xl font-semibold text-forest-950">Pregled prvih jedinica</h2></div><Link href="/apartmani" className="hidden rounded-full bg-forest-900 px-6 py-3 text-white md:block">Svi apartmani</Link></div><div className="mt-8 grid gap-5 md:grid-cols-3">{apartments.slice(0,6).map((a)=><div key={a.slug} className="rounded-3xl bg-white p-5"><p className="text-2xl font-semibold">{a.code}</p><p className="text-stone-600">{a.floor} · {a.type}</p></div>)}</div></div></section>
      <ContactCta />
    </main>
  );
}
