export type ApartmentStatus = "available" | "reserved" | "sold";

export type Apartment = {
  id: number;
  code: string;
  slug: string;
  floor: "Prizemlje" | "I sprat" | "II sprat" | "Povučeni sprat";
  type: "Apartman";
  marketArea: number;
  status: ApartmentStatus;
};

const apartmentAreas = [
  51.69, 29.92, 33.34, 43.36, 37.16, 46.12, 53.17, 32.54, 34.67, 29.91, 32.18, 54.75, 38.24, 53.34, 33.35, 33.49,
  32.54, 34.67, 29.91, 32.18, 54.75, 38.24, 53.34, 33.35, 33.49, 71.76, 51.62, 60.61, 70.41, 63.2, 55.37,
] as const;

function getFloor(id: number): Apartment["floor"] {
  if (id <= 7) return "Prizemlje";
  if (id <= 16) return "I sprat";
  if (id <= 25) return "II sprat";
  return "Povučeni sprat";
}

export const apartments: Apartment[] = apartmentAreas.map((marketArea, index) => {
  const id = index + 1;

  return {
    id,
    code: `A${id}`,
    slug: `a${id}`,
    floor: getFloor(id),
    type: "Apartman",
    marketArea,
    status: "available",
  } satisfies Apartment;
});

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
