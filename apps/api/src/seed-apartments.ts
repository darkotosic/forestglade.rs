import { prisma } from "./prisma.js";

const apartments = [
  ["A1", "Prizemlje", "Dvoiposoban apartman", "51.69"], ["A2", "Prizemlje", "Jednosoban apartman", "29.92"], ["A3", "Prizemlje", "Jednosoban apartman", "33.34"], ["A4", "Prizemlje", "Dvosoban apartman", "43.36"], ["A5", "Prizemlje", "Jednoiposoban apartman", "37.16"], ["A6", "Prizemlje", "Dvosoban apartman", "46.12"], ["A7", "Prizemlje", "Dvoiposoban apartman", "53.17"],
  ["A8", "I sprat", "Jednoiposoban apartman", "32.54"], ["A9", "I sprat", "Jednoiposoban apartman", "34.67"], ["A10", "I sprat", "Jednosoban apartman", "29.91"], ["A11", "I sprat", "Jednosoban apartman", "32.18"], ["A12", "I sprat", "Dvoiposoban apartman", "54.75"], ["A13", "I sprat", "Dvosoban apartman", "38.24"], ["A14", "I sprat", "Dvoiposoban apartman", "53.34"], ["A15", "I sprat", "Jednosoban apartman", "33.35"], ["A16", "I sprat", "Jednosoban apartman", "33.49"],
  ["A17", "II sprat", "Jednoiposoban apartman", "32.54"], ["A18", "II sprat", "Jednoiposoban apartman", "34.67"], ["A19", "II sprat", "Jednosoban apartman", "29.91"], ["A20", "II sprat", "Jednosoban apartman", "32.18"], ["A21", "II sprat", "Dvoiposoban apartman", "54.75"], ["A22", "II sprat", "Dvosoban apartman", "38.24"], ["A23", "II sprat", "Dvoiposoban apartman", "53.34"], ["A24", "II sprat", "Jednosoban apartman", "33.35"], ["A25", "II sprat", "Jednosoban apartman", "33.49"],
  ["A26", "Povučeni sprat", "Dvoiposoban apartman", "71.76"], ["A27", "Povučeni sprat", "Dvosoban apartman", "51.62"], ["A28", "Povučeni sprat", "Dvosoban apartman", "60.61"], ["A29", "Povučeni sprat", "Dvoiposoban apartman", "70.41"], ["A30", "Povučeni sprat", "Dvosoban apartman", "63.20"], ["A31", "Povučeni sprat", "Dvosoban apartman", "55.37"],
] as const;

for (const [code, floor, officialType, marketArea] of apartments) {
  const sortOrder = Number(code.slice(1));
  await prisma.apartment.upsert({
    where: { code },
    update: { slug: code.toLowerCase(), floor, officialType, marketArea, sourceLocked: true, isPublished: true, sortOrder },
    create: { code, slug: code.toLowerCase(), floor, officialType, marketArea, sourceLocked: true, status: "AVAILABLE", isPublished: true, sortOrder },
  });
}
console.log(`Seeded ${apartments.length} official PGD/PDF apartments.`);
await prisma.$disconnect();
