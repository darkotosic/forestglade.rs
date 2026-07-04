import Link from "next/link";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";
import { navigation, site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-forest-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <span className="flex size-11 items-center justify-center rounded-full bg-gold-300 text-forest-950"><Leaf size={21} /></span>
          <span><strong className="block text-base tracking-[0.18em]">FOREST GLADE</strong><span className="text-xs uppercase tracking-[0.45em] text-mist-200">d.o.o.</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-mist-100 lg:flex">
          {navigation.map((item) => <Link key={item.href} href={item.href} className="transition hover:text-gold-300">{item.label}</Link>)}
        </nav>
        <Link href="/kontakt" className="rounded-full bg-gold-300 px-5 py-3 text-sm font-semibold text-forest-950 transition hover:bg-white">Zakažite prezentaciju</Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-forest-950 text-mist-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_.7fr_1fr] lg:px-8">
        <div><p className="text-2xl font-semibold text-white">FOREST GLADE</p><p className="mt-4 max-w-md leading-7 text-mist-200">Forest Glade d.o.o razvija savremeni apart-hotel koncept u Vrdniku, sa fokusom na kvalitet gradnje, funkcionalne apartmane i poverenje kupaca.</p><p className="mt-4 text-sm text-mist-300">Zvaničan telefon: POTREBNA PROVERA.</p></div>
        <div><p className="font-semibold text-white">Linkovi</p><div className="mt-4 grid gap-3 text-sm">{navigation.map((item) => <Link key={item.href} href={item.href} className="hover:text-gold-300">{item.label}</Link>)}</div></div>
        <div><p className="font-semibold text-white">Kontakt</p><div className="mt-4 space-y-3 text-sm"><p className="flex gap-3"><Mail size={18} className="text-gold-300" /> {site.email}</p><p className="flex gap-3"><MapPin size={18} className="text-gold-300" /> {site.location}</p>{site.phone !== "POTREBNA PROVERA" ? <p className="flex gap-3"><Phone size={18} className="text-gold-300" /> Telefon: {site.phone}</p> : <p className="flex gap-3"><Phone size={18} className="text-gold-300" /> Telefon: POTREBNA PROVERA</p>}</div></div>
      </div>
    </footer>
  );
}

export function ContactCta() {
  return <section className="bg-ivory-100 px-5 py-18 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-forest-900 p-8 text-white shadow-2xl md:grid-cols-[1fr_auto] md:items-center md:p-12"><div><p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-300">Prodajna prezentacija</p><h2 className="mt-4 text-3xl font-semibold md:text-5xl">Zatražite prezentaciju projekta</h2><p className="mt-4 max-w-2xl text-mist-200">Za tačan termin prezentacije i dostupnost apartmana kontaktirajte prodajni tim.</p></div><Link href="/kontakt" className="rounded-full bg-gold-300 px-7 py-4 text-center font-semibold text-forest-950 hover:bg-white">Kontaktirajte nas</Link></div></section>;
}
