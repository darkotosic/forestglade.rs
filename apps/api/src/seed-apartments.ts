import { OFFICIAL_APARTMENTS } from "@forestglade/project-data";
import { prisma } from "./prisma.js";

for (const apartment of OFFICIAL_APARTMENTS) {
  const { code, slug, floor, officialType, marketArea, sortOrder } = apartment;
  await prisma.apartment.upsert({
    where: { code },
    update: {
      slug,
      floor,
      officialType,
      marketArea,
      sourceLocked: true,
      isPublished: true,
      sortOrder,
    },
    create: {
      code,
      slug,
      floor,
      officialType,
      marketArea,
      sourceLocked: true,
      status: "AVAILABLE",
      isPublished: true,
      sortOrder,
    },
  });
}
console.log(`Seeded ${OFFICIAL_APARTMENTS.length} official PGD/PDF apartments.`);
await prisma.$disconnect();
