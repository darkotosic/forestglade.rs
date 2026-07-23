export const FLOOR_LABELS = [
  "Suteren",
  "Prizemlje",
  "I sprat",
  "II sprat",
  "Povučeni sprat",
] as const;

export type OfficialApartment = {
  code: string;
  slug: string;
  floor: (typeof FLOOR_LABELS)[number];
  officialType: string;
  marketArea: string;
  sortOrder: number;
};

const officialApartmentRows = [
  ["A1", "Prizemlje", "Dvoiposoban apartman", "51.69"],
  ["A2", "Prizemlje", "Jednosoban apartman", "29.92"],
  ["A3", "Prizemlje", "Jednosoban apartman", "33.34"],
  ["A4", "Prizemlje", "Dvosoban apartman", "43.36"],
  ["A5", "Prizemlje", "Jednoiposoban apartman", "37.16"],
  ["A6", "Prizemlje", "Dvosoban apartman", "46.12"],
  ["A7", "Prizemlje", "Dvoiposoban apartman", "53.17"],
  ["A8", "I sprat", "Jednoiposoban apartman", "32.54"],
  ["A9", "I sprat", "Jednoiposoban apartman", "34.67"],
  ["A10", "I sprat", "Jednosoban apartman", "29.91"],
  ["A11", "I sprat", "Jednosoban apartman", "32.18"],
  ["A12", "I sprat", "Dvoiposoban apartman", "54.75"],
  ["A13", "I sprat", "Dvosoban apartman", "38.24"],
  ["A14", "I sprat", "Dvoiposoban apartman", "53.34"],
  ["A15", "I sprat", "Jednosoban apartman", "33.35"],
  ["A16", "I sprat", "Jednosoban apartman", "33.49"],
  ["A17", "II sprat", "Jednoiposoban apartman", "32.54"],
  ["A18", "II sprat", "Jednoiposoban apartman", "34.67"],
  ["A19", "II sprat", "Jednosoban apartman", "29.91"],
  ["A20", "II sprat", "Jednosoban apartman", "32.18"],
  ["A21", "II sprat", "Dvoiposoban apartman", "54.75"],
  ["A22", "II sprat", "Dvosoban apartman", "38.24"],
  ["A23", "II sprat", "Dvoiposoban apartman", "53.34"],
  ["A24", "II sprat", "Jednosoban apartman", "33.35"],
  ["A25", "II sprat", "Jednosoban apartman", "33.49"],
  ["A26", "Povučeni sprat", "Dvoiposoban apartman", "71.76"],
  ["A27", "Povučeni sprat", "Dvosoban apartman", "51.62"],
  ["A28", "Povučeni sprat", "Dvosoban apartman", "60.61"],
  ["A29", "Povučeni sprat", "Dvoiposoban apartman", "70.41"],
  ["A30", "Povučeni sprat", "Dvosoban apartman", "63.20"],
  ["A31", "Povučeni sprat", "Dvosoban apartman", "55.37"],
] as const;

export const OFFICIAL_APARTMENTS: OfficialApartment[] = officialApartmentRows.map(
  ([code, floor, officialType, marketArea]) => ({
    code,
    slug: code.toLowerCase(),
    floor,
    officialType,
    marketArea,
    sortOrder: Number(code.slice(1)),
  }),
);

export const OFFICIAL_PROJECT_FACTS = {
  companyName: "Forest Glade d.o.o",
  project: "Forest Glade Apart Hotel",
  location: "Velika Međa bb, Vrdnik",
  type: "Apart Hotel",
  floors: "Suteren + Prizemlje + I sprat + II sprat + Povučeni sprat",
  totalApartments: 31,
  grossArea: "2.271,82 m²",
  netArea: "1.918,11 m²",
  marketArea: "1.540,01 m²",
  parking: "21 parking mesto",
} as const;

export const MATERIALIZATION_FACTS = [
  "ravne linije i kubusi",
  "demit fasada",
  "imitacija kamena",
  "imitacija drveta",
  "pastelne boje",
  "PVC stolarija sa roletnama",
  "aluminijumski ulaz",
] as const;
