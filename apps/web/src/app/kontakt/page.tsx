import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SectionHeading } from "@/components/section-heading";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Kontakt", description: "Kontaktirajte Forest Glade prodajni tim za prezentaciju i dostupnost apartmana." };

export default function KontaktPage() {
  return <main className="bg-ivory-100"><section className="bg-forest-950 px-5 py-20 text-white lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeading light eyebrow="Kontakt" title="Zakažite prezentaciju Forest Glade Apart Hotela" description="Za tačan termin prezentacije i dostupnost apartmana kontaktirajte prodajni tim." /></div></section><section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[.9fr_1.1fr] lg:px-8"><div className="space-y-5"><div className="rounded-[2rem] bg-white p-7 shadow-sm"><Mail className="text-gold-500" /><h2 className="mt-4 text-2xl font-semibold">Email</h2><p className="mt-2 text-stone-600">{site.email}</p></div><div className="rounded-[2rem] bg-white p-7 shadow-sm"><Phone className="text-gold-500" /><h2 className="mt-4 text-2xl font-semibold">Telefon</h2><p className="mt-2 text-stone-600">Telefon: {site.phone}</p></div><div className="rounded-[2rem] bg-white p-7 shadow-sm"><MapPin className="text-gold-500" /><h2 className="mt-4 text-2xl font-semibold">Lokacija</h2><p className="mt-2 text-stone-600">{site.location}</p></div><div className="rounded-[2rem] border border-gold-300/40 bg-forest-900 p-8 text-white"><p className="text-sm uppercase tracking-[0.3em] text-gold-300">Mapa</p><p className="mt-8 text-3xl font-semibold">Velika Međa bb, Vrdnik</p></div></div><ContactForm /></section></main>;
}
