import type { Metadata } from "next";
import { ContactCta } from "@/components/site-shell";
import { OFFICIAL_PROJECT_FACTS } from "@forestglade/project-data";
export const metadata: Metadata = {
  title: "Lokacija | Forest Glade",
  description: "Lokacija Forest Glade Apart Hotela: Velika Međa bb, Vrdnik.",
};
export default function Page() {
  return (
    <main>
      <section className="bg-stone-100">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <p className="text-sm uppercase tracking-[0.35em] text-forest-700">Lokacija</p>
          <h1 className="mt-3 text-5xl font-semibold text-forest-950">Velika Međa bb, Vrdnik</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">
            Javno prikazujemo samo potvrđene podatke o lokaciji. Udaljenosti do banje, centra,
            aerodroma i drugih tačaka nisu navedene dok ne budu proverene.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p>
            <b>Adresa:</b> {OFFICIAL_PROJECT_FACTS.location}
          </p>
          <p className="mt-3">
            <b>Koordinate:</b> POTREBNA PROVERA
          </p>
        </div>
      </section>
      <ContactCta />
    </main>
  );
}
