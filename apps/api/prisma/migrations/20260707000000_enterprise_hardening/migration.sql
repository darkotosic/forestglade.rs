CREATE TYPE "SourceStatus" AS ENUM ('VERIFIED', 'POTREBNA_PROVERA');
ALTER TABLE "Lead" ADD COLUMN "consentAccepted" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN "ipAddress" TEXT, ADD COLUMN "userAgent" TEXT, ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "SiteSetting" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE "ApartmentRoom" (
  "id" TEXT NOT NULL,
  "apartmentId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "area" DECIMAL(8,2),
  "floorMaterial" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "sourceStatus" "SourceStatus" NOT NULL DEFAULT 'POTREBNA_PROVERA',
  "sourceNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApartmentRoom_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ApartmentRoom_apartmentId_idx" ON "ApartmentRoom"("apartmentId");
ALTER TABLE "ApartmentRoom" ADD CONSTRAINT "ApartmentRoom_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
