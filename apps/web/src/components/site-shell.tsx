import Link from "next/link";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";

const nav = [
  ["Projekat", "/projekat"],
  ["Apartmani", "/apartmani"],
  ["Virtuelne šetnje", "/virtuelne-setnje"],
  ["Lokacija", "/lokacija"],
  ["Galerija", "/galerija"],
  ["Kontakt", "/kontakt"],
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-forest-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-stone-50">
          <span className="flex size-10 items-center justify-center rounded-full bg-gold-300 text-forest-950"><Leaf size={20} /></span>
          <span><strong className="block text-lg tracking-wide">Forest Glade</strong><span className="text-xs uppercase tracking-[0.35em] text-stone-300">Apart Hotel</span></span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-stone-200 lg:flex">
          {nav.map(([label, href]) => <Link key={href} href={href} className="hover:text-gold-200">{label}</Link>)}
        </nav>
        <Link href="/kontakt" className="rounded-full bg-stone-100 px-5 py-2 text-sm font-semibold text-forest-950 hover:bg-gold-200">Zakažite prezentaciju</Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-forest-950 text-stone-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-3 lg:px-8">
        <div><p className="text-2xl font-semibold text-white">Forest Glade</p><p className="mt-3 text-sm leading-6 text-stone-300">Premium digitalni prodajni centar za apart-hotel u Vrdniku, osmišljen za kupce, investitore i brzu proveru raspoloživosti.</p></div>
        <div><p className="font-semibold text-white">Navigacija</p><div className="mt-3 grid gap-2 text-sm">{nav.map(([label, href]) => <Link key={href} href={href} className="hover:text-gold-200">{label}</Link>)}</div></div>
        <div><p className="font-semibold text-white">Kontakt</p><div className="mt-3 space-y-3 text-sm"><p className="flex gap-2"><MapPin size={18}/> Velika Međa bb, Vrdnik</p><p className="flex gap-2"><Phone size={18}/> Prodajni tim</p><p className="flex gap-2"><Mail size={18}/> info@forestglade.rs</p></div></div>
      </div>
    </footer>
  );
}

export function ContactCta() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="rounded-[2rem] bg-forest-900 p-8 text-white shadow-2xl md:p-12">
        <p className="text-sm uppercase tracking-[0.35em] text-gold-200">Prodaja apartmana</p>
        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <h2 className="text-3xl font-semibold md:text-5xl">Zatražite PDF prezentaciju, osnovu i termin obilaska.</h2>
          <Link href="/kontakt" className="rounded-full bg-gold-200 px-7 py-4 text-center font-semibold text-forest-950">Kontaktirajte nas</Link>
        </div>
      </div>
    </section>
  );
}
