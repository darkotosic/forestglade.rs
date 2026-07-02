export type ApartmentStatus = "available" | "reserved" | "sold";

export type Apartment = {
  id: number;
  code: string;
  slug: string;
  floor: "Prizemlje" | "I sprat" | "II sprat" | "Povučeni sprat";
  type: "Studio" | "Dvosoban" | "Trosoban";
  marketArea: number | null;
  status: ApartmentStatus;
};

const floors = [
  { floor: "Prizemlje", from: 1, to: 7 },
  { floor: "I sprat", from: 8, to: 16 },
  { floor: "II sprat", from: 17, to: 25 },
  { floor: "Povučeni sprat", from: 26, to: 31 },
] as const;

export const apartments: Apartment[] = floors.flatMap(({ floor, from, to }) =>
  Array.from({ length: to - from + 1 }, (_, index) => {
    const id = from + index;
    const type = id % 5 === 0 ? "Trosoban" : id % 2 === 0 ? "Dvosoban" : "Studio";

    return {
      id,
      code: `A${id}`,
      slug: `a${id}`,
      floor,
      type,
      marketArea: null,
      status: "available",
    } satisfies Apartment;
  }),
);

export const projectFacts = {
  name: "Forest Glade",
  category: "Apart Hotel",
  location: "Velika Međa bb, Vrdnik",
  totalApartments: 31,
  floors: "Suteren + Prizemlje + 2 sprata + Povučeni sprat",
  grossArea: "2.271,82 m²",
  marketArea: "1.540,01 m²",
};

export function getApartment(slug: string) {
  return apartments.find((apartment) => apartment.slug === slug);
}
