import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { projectFacts } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projekti",
  description: "Forest Glade projekti, sa fokusom na Forest Glade Apart Hotel u Vrdniku.",
};

export default function ProjektiPage() {
  const details = [
    "Lokacija: " + projectFacts.location,
    "Apartmani: " + projectFacts.totalApartments,
    "Spratnost: " + projectFacts.floors,
    "Bruto površina: " + projectFacts.grossArea,
    "Tržišna površina: " + projectFacts.marketArea,
    "Parking: " + projectFacts.parking,
  ];
  return (
    <main className="bg-ivory-100">
      <section className="bg-forest-950 px-5 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            light
            eyebrow="Projekti"
            title="Aktuelni razvojni portfolio"
            description="Forest Glade d.o.o trenutno fokusira komunikaciju na premium apart-hotel projekat u Vrdniku."
          />
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-16 md:grid-cols-3 lg:px-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">
            Aktuelni projekat
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-forest-950">{projectFacts.project}</h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">
            Moderan premium apart-hotel u Vrdniku, projektovan za funkcionalan boravak, jasnu
            prodajnu prezentaciju i dugoročnu investicionu vrednost.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {details.map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-ivory-100 p-4 text-sm font-medium text-forest-950"
              >
                {item}
              </div>
            ))}
          </div>
          <Link
            href="/kontakt"
            className="mt-8 inline-flex rounded-full bg-forest-900 px-7 py-4 font-semibold text-white"
          >
            Kontakt za prezentaciju
          </Link>
        </div>
        <div className="grid gap-6">
          <ProjectCard
            title="U pripremi"
            status="Planiranje"
            description="Naredni projekti biće predstavljeni kada lokacije i obim budu zvanično potvrđeni."
          />
          <ProjectCard
            title="Budući razvoj"
            status="Portfolio"
            description="Fokus ostaje na kvalitetnoj arhitekturi, transparentnosti i pažljivo odabranim prilikama."
          />
        </div>
      </section>
    </main>
  );
}
