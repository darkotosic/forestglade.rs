ALTER TYPE "MediaPlacement" ADD VALUE 'APARTMENT_CATALOG';

ALTER TABLE "MediaAsset"
ADD COLUMN "isCover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "originalFilename" TEXT,
ADD COLUMN "cloudinaryResourceType" TEXT NOT NULL DEFAULT 'image';

CREATE INDEX "MediaAsset_apartmentId_isPublished_sortOrder_idx" ON "MediaAsset"("apartmentId", "isPublished", "sortOrder");
CREATE INDEX "MediaAsset_apartmentId_isCover_idx" ON "MediaAsset"("apartmentId", "isCover");
