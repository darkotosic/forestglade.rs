import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Gem, ShieldCheck, Sparkles, TreePine } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { ContactCta } from "@/components/site-shell";
import { StatCard } from "@/components/stat-card";
import { AnimatedNumber } from "@/components/animated-number";
import { projectFacts, site } from "@/lib/site";

const stats = [[projectFacts.totalApartments, "apartman"], [projectFacts.grossArea, "bruto"], [projectFacts.marketArea, "tržišna površina"], ["21", "parking mesto"]];
const trust = [[ShieldCheck, "Kvalitet gradnje", "Demit fasada, PVC stolarija sa roletnama, aluminijumski ulaz i kvalitetna završna obrada."], [Building2, "Savremena arhitektura", "Ravne linije, kubusi, imitacija kamena i drveta, pastelna fasada uklopljena u ambijent Vrdnika."], [Gem, "Poverenje i transparentnost", "Jasni projektni podaci, dokumentacija i prodajna komunikacija za kupce i investitore."]];
const journey = ["Pregled dostupnosti i osnova", "Privatna prezentacija projekta", "Dokumentacija i prodajni sledeći koraci"];

export default function Home() {
  const schema = { "@context": "https://schema.org", "@type": "RealEstateAgent", name: site.name, url: site.url, email: site.email, address: site.location };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <section className="relative isolate overflow-hidden bg-forest-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(201,162,39,.32),transparent_28%),radial-gradient(circle_at_78%_10%,rgba(219,229,225,.16),transparent_24%),linear-gradient(135deg,rgba(0,43,38,.9),rgba(0,60,53,.94)),url('/renders/hero-placeholder.svg')] bg-cover bg-center" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-forest-950 to-transparent" />
      <div className="relative mx-auto grid min-h-[820px] max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-[1.06fr_.94fr] lg:px-8">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-300/40 bg-white/10 px-4 py-2 text-sm text-gold-300 shadow-[0_0_50px_rgba(201,162,39,.18)] backdrop-blur"><Sparkles size={16} /> {projectFacts.location}</p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">Forest Glade Apart Hotel</h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-mist-100">Premium apartmani u Vrdniku, na obroncima Fruške Gore — prezentovani kroz jasne podatke, sigurnu komunikaciju i iskustvo kupovine dostojno investicionog proizvoda.</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row"><Link href="/projekti" className="rounded-full bg-gold-300 px-7 py-4 text-center font-semibold text-forest-950 shadow-xl shadow-gold-300/20 transition hover:-translate-y-0.5 hover:bg-white">Pogledaj projekte</Link><Link href="/kontakt" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-4 font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:border-gold-300 hover:text-gold-300">Kontaktirajte nas <ArrowRight size={18}/></Link></div>
          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">{journey.map((item, index) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[.07] p-4 backdrop-blur"><span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">0{index + 1}</span><p className="mt-2 text-sm leading-6 text-mist-100">{item}</p></div>)}</div>
        </div>
        <div className="rounded-[2.5rem] border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="rounded-[2rem] bg-ivory-100 p-5 text-forest-950">
            <div className="flex items-center justify-between gap-4 border-b border-forest-950/10 pb-5"><div><p className="text-xs font-semibold uppercase tracking-[0.3em] text-forest-700">Project snapshot</p><h2 className="mt-2 text-2xl font-semibold">Investiciono čitljiv format</h2></div><TreePine className="text-gold-500" /></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">{stats.map(([value, label]) => <StatCard key={label} value={value} label={label} variant="light" />)}</div>
          </div>
        </div>
      </div>
    </section>
    <section className="bg-ivory-100 px-5 py-20 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_.55fr] lg:items-stretch"><div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-forest-950/5 md:p-12"><p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">Forest Glade d.o.o</p><h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">Savremeni apart-hotel koncept za kupce i investitore koji traže dugoročnu vrednost.</h2><p className="mt-6 text-lg leading-8 text-stone-600">Forest Glade d.o.o razvija savremeni apart-hotel koncept u Vrdniku, sa fokusom na kvalitet gradnje, funkcionalne apartmane i premium prezentaciju za kupce i investitore.</p><div className="mt-8 grid gap-3 text-sm font-medium text-forest-800 sm:grid-cols-3">{journey.map((item) => <p key={item} className="flex gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-gold-500" />{item}</p>)}</div></div><div className="rounded-[2rem] bg-gold-300 p-8 text-forest-950 shadow-xl shadow-gold-300/20 md:p-10"><p className="text-sm font-semibold uppercase tracking-[0.25em]">Ključni podaci</p><p className="mt-8 text-4xl font-semibold"><AnimatedNumber value={projectFacts.totalApartments} /></p><p className="mt-2 text-lg">apartman u objektu spratnosti {projectFacts.floors}.</p></div></div></section>
    <section className="bg-white px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Projekti" title="Najnovije iz Forest Glade portfolija" /><div className="mt-10 grid gap-6 md:grid-cols-3"><ProjectCard featured title="Forest Glade Apart Hotel" status="Aktuelni projekat" description="Premium apart-hotel u Vrdniku sa funkcionalnim apartmanima, parkingom i savremenom materijalizacijom." href="/projekti" facts={[projectFacts.location, `${projectFacts.totalApartments} apartman`, projectFacts.marketArea]} /><ProjectCard title="Budući projekti" status="U pripremi" description="Planiranje narednih razvojnih koraka bez navođenja lokacija dok ne budu zvanično potvrđene." /><ProjectCard title="Prodajna prezentacija" status="Za kupce" description="Zatražite informacije o dostupnosti, dokumentaciji i terminima prezentacije projekta." /></div></div></section>
    <section className="bg-forest-900 px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeading light eyebrow="Poverenje" title="Iskustvo, kvalitet i transparentna prezentacija" /><div className="mt-10 grid gap-6 md:grid-cols-3">{trust.map(([Icon, title, text]) => { const I = Icon as typeof ShieldCheck; return <article key={title as string} className="rounded-[2rem] border border-white/10 bg-white/10 p-7 text-white shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-gold-300/40"><I className="text-gold-300" /><h3 className="mt-5 text-2xl font-semibold">{title as string}</h3><p className="mt-4 leading-7 text-mist-200">{text as string}</p></article>; })}</div></div></section>
    <ContactCta />
  </main>;
}
