import assert from "node:assert/strict";
import test from "node:test";
import { selectApartmentCover } from "../media-cover";
import type { MediaAssetDto } from "../types";
const item = (
  id: string,
  placement: MediaAssetDto["placement"],
  isCover = false,
  isPublished = true,
): MediaAssetDto => ({
  id,
  title: id,
  alt: id,
  caption: null,
  secureUrl: id,
  thumbnailUrl: null,
  originalFilename: `${id}.jpg`,
  cloudinaryResourceType: "image",
  placement,
  type: "IMAGE" as const,
  isPublished,
  isCover,
  sortOrder: 0,
  format: "jpg",
  width: 1200,
  height: 800,
  durationSeconds: null,
  bytes: 2048,
});
test("cover priority", () => {
  assert.equal(
    selectApartmentCover([
      item("first", "INTERIOR"),
      item("catalog", "APARTMENT_CATALOG"),
      item("cover", "INTERIOR", true),
    ])?.id,
    "cover",
  );
  assert.equal(
    selectApartmentCover([item("first", "INTERIOR"), item("catalog", "APARTMENT_CATALOG")])?.id,
    "catalog",
  );
  assert.equal(selectApartmentCover([item("first", "INTERIOR")])?.id, "first");
  assert.equal(selectApartmentCover([]), null);
});
