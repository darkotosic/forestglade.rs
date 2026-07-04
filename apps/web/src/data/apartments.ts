import { OFFICIAL_APARTMENTS, OFFICIAL_PROJECT_FACTS } from "@forestglade/project-data";

export type ApartmentStatus = "available" | "reserved" | "sold";

export type Apartment = {
  id: number;
  code: string;
  slug: string;
  floor: string;
  type: "Apartman";
  officialType: string;
  marketArea: number;
  status: ApartmentStatus;
};

export const apartments: Apartment[] = OFFICIAL_APARTMENTS.map((apartment) => ({
  id: apartment.sortOrder,
  code: apartment.code,
  slug: apartment.slug,
  floor: apartment.floor,
  type: "Apartman",
  officialType: apartment.officialType,
  marketArea: Number(apartment.marketArea),
  status: "available",
}));

export const projectFacts = {
  name: OFFICIAL_PROJECT_FACTS.project,
  category: OFFICIAL_PROJECT_FACTS.type,
  location: OFFICIAL_PROJECT_FACTS.location,
  totalApartments: OFFICIAL_PROJECT_FACTS.totalApartments,
  floors: OFFICIAL_PROJECT_FACTS.floors,
  grossArea: OFFICIAL_PROJECT_FACTS.grossArea,
  netArea: OFFICIAL_PROJECT_FACTS.netArea,
  marketArea: OFFICIAL_PROJECT_FACTS.marketArea,
  parking: OFFICIAL_PROJECT_FACTS.parking,
};

export function getApartment(slug: string) {
  return apartments.find((apartment) => apartment.slug === slug);
}

export { FLOOR_LABELS, MATERIALIZATION_FACTS, OFFICIAL_APARTMENTS, OFFICIAL_PROJECT_FACTS } from "@forestglade/project-data";
