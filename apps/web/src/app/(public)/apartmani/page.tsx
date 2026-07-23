import type { Metadata } from "next";
import { PublicApartmentList } from "@/components/public/public-apartment-list";
import { apartments } from "@/data/apartments";

export const metadata: Metadata = {
  title: "Apartmani",
  description: "Lista svih 31 apartmana Forest Glade apart-hotela u Vrdniku.",
};

export default function ApartmentsPage() {
  const floors = [...new Set(apartments.map((a) => a.floor))];
  return (
    <main className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <p className="text-sm uppercase tracking-[0.35em] text-forest-700">31 apartman</p>
      <h1 className="mt-3 text-5xl font-semibold text-forest-950">Apartmani</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">
        Pregled apartmana po spratovima. Zvanične kvadrature dolaze iz zaključanog izvora podataka,
        a statusi i cene se dopunjuju iz API-ja kada su potvrđeni.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {floors.map((floor) => (
          <span key={floor} className="rounded-full bg-stone-200 px-4 py-2 text-sm">
            {floor}
          </span>
        ))}
        <span className="rounded-full bg-forest-900 px-4 py-2 text-sm text-white">
          Live status iz API-ja
        </span>
      </div>
      <PublicApartmentList />
    </main>
  );
}
