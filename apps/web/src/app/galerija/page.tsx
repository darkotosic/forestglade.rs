import type { Metadata } from "next";
import { ContactCta } from "@/components/site-shell";
import { projectFacts } from "@/data/apartments";

export const metadata: Metadata = { title: "galerija" };

export default function Page() {
  const title = {
    projekat: "Projekat",
    "virtuelne-setnje": "Virtuelne šetnje",
    lokacija: "Lokacija",
    galerija: "Galerija",
    kontakt: "Kontakt",
  }["galerija"];

  return (
    <main>
      <section className="bg-stone-100">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <p className="text-sm uppercase tracking-[0.35em] text-forest-700">Forest Glade</p>
          <h1 className="mt-3 text-5xl font-semibold text-forest-950">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">
            {projectFacts.category}, {projectFacts.location}. Objekat ima {projectFacts.totalApartments} apartman, spratnost {projectFacts.floors}, bruto površinu {projectFacts.grossArea} i tržišnu površinu {projectFacts.marketArea}.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-semibold text-forest-950">Premium prezentacija za prodaju</h2>
          <p className="mt-4 max-w-4xl leading-8 text-stone-600">
            Ova sekcija je pripremljena za render galerije, osnove, 3D ture, lokacijske prednosti, materijale i kontakt tok prodajnog tima. Sadržaj je strukturiran tako da se kasnije poveže sa Render backend-om i PostgreSQL bazom.
          </p>
        </div>
      </section>
      <ContactCta />
    </main>
  );
}
