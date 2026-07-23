CREATE TYPE "MediaIngestMethod" AS ENUM ('LEGACY', 'DIRECT_UPLOAD', 'SERVER_UPLOAD', 'CLOUDINARY_IMPORT');
ALTER TABLE "MediaAsset" ADD COLUMN "ingestMethod" "MediaIngestMethod" NOT NULL DEFAULT 'LEGACY';
ALTER TABLE "MediaAsset" ADD COLUMN "cloudinaryAssetId" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN "cloudinaryVersion" INTEGER;
ALTER TABLE "MediaAsset" ADD COLUMN "importSourceUrl" TEXT;

WITH duplicates AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "cloudinaryResourceType", "cloudinaryPublicId" ORDER BY "createdAt" ASC, "id" ASC) AS position
  FROM "MediaAsset"
)
DELETE FROM "MediaAsset" WHERE "id" IN (SELECT "id" FROM duplicates WHERE position > 1);

CREATE UNIQUE INDEX "MediaAsset_cloudinaryAssetId_key" ON "MediaAsset"("cloudinaryAssetId");
CREATE UNIQUE INDEX "MediaAsset_cloudinary_resource_public_id_key" ON "MediaAsset"("cloudinaryResourceType", "cloudinaryPublicId");

WITH ranked_covers AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "apartmentId"
      ORDER BY "sortOrder" ASC, "createdAt" ASC
    ) AS position
  FROM "MediaAsset"
  WHERE "isCover" = true
    AND "apartmentId" IS NOT NULL
)
UPDATE "MediaAsset"
SET "isCover" = false
WHERE "id" IN (
  SELECT "id"
  FROM ranked_covers
  WHERE position > 1
);

CREATE UNIQUE INDEX
  "MediaAsset_single_cover_per_apartment_idx"
ON "MediaAsset" ("apartmentId")
WHERE "isCover" = true
  AND "apartmentId" IS NOT NULL;
