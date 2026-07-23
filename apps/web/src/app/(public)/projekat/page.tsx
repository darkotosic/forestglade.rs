import type { Metadata } from "next";
import { ContactCta } from "@/components/site-shell";
import { MATERIALIZATION_FACTS, OFFICIAL_PROJECT_FACTS } from "@forestglade/project-data";
export const metadata: Metadata = {
  title: "Projekat | Forest Glade",
  description: "Zvanični podaci za Forest Glade Apart Hotel u Vrdniku.",
};
export default function Page() {
  const facts = [
    ["Naziv", OFFICIAL_PROJECT_FACTS.project],
    ["Lokacija", OFFICIAL_PROJECT_FACTS.location],
    ["Tip objekta", OFFICIAL_PROJECT_FACTS.type],
    ["Spratnost", OFFICIAL_PROJECT_FACTS.floors],
    ["Broj apartmana", String(OFFICIAL_PROJECT_FACTS.totalApartments)],
    ["Pbruto", OFFICIAL_PROJECT_FACTS.grossArea],
    ["Pneto", OFFICIAL_PROJECT_FACTS.netArea],
    ["Ptrž.", OFFICIAL_PROJECT_FACTS.marketArea],
    ["Parking", OFFICIAL_PROJECT_FACTS.parking],
  ];
  return (
    <main>
      <section className="bg-stone-100">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <p className="text-sm uppercase tracking-[0.35em] text-forest-700">Forest Glade</p>
          <h1 className="mt-3 text-5xl font-semibold text-forest-950">Forest Glade Apart Hotel</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">
            Zvanični pregled projekta na adresi Velika Međa bb, Vrdnik, bez neproverenih cena,
            rokova ili udaljenosti.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-16 lg:grid-cols-2 lg:px-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-semibold text-forest-950">Osnovni podaci</h2>
          <dl className="mt-6 grid gap-3">
            {facts.map(([k, v]) => (
              <div className="flex justify-between gap-6 border-b border-stone-100 py-2" key={k}>
                <dt className="font-semibold">{k}</dt>
                <dd className="text-right text-stone-600">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-semibold text-forest-950">Materijalizacija</h2>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-stone-600">
            {MATERIALIZATION_FACTS.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </section>
      <ContactCta />
    </main>
  );
}
