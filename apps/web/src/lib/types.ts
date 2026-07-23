export type ApartmentStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "HIDDEN";
export type MediaPlacement =
  | "HOME_HERO"
  | "PROJECT_GALLERY"
  | "APARTMENT_GALLERY"
  | "APARTMENT_CATALOG"
  | "APARTMENT_PLAN"
  | "FLOOR_PLAN"
  | "EXTERIOR"
  | "INTERIOR"
  | "VIRTUAL_TOUR"
  | "DOCUMENTATION";
export type MediaType = "IMAGE" | "VIDEO" | "DOCUMENT" | "FLOOR_PLAN" | "RENDER" | "VIRTUAL_TOUR";
export type MediaAssetDto = {
  id: string;
  title: string;
  alt: string | null;
  caption: string | null;
  secureUrl: string;
  thumbnailUrl: string | null;
  originalFilename: string | null;
  cloudinaryResourceType: "image" | "video" | "raw";
  placement: MediaPlacement;
  type: MediaType;
  isPublished: boolean;
  isCover: boolean;
  sortOrder: number;
  format: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  bytes: number | null;
  ingestMethod?: "LEGACY" | "DIRECT_UPLOAD" | "SERVER_UPLOAD" | "CLOUDINARY_IMPORT";
  cloudinaryAssetId?: string | null;
  cloudinaryVersion?: number | null;
  importSourceUrl?: string | null;
  cloudinaryPublicId?: string;
  apartment?: { code: string; slug: string } | null;
};
export type AdminApartmentDto = {
  id: string;
  code: string;
  slug: string;
  floor: string;
  officialType: string;
  marketArea: string;
  status: ApartmentStatus;
  price: string | null;
  priceNote: string | null;
  shortDescription: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
  sourceLocked: boolean;
  media?: MediaAssetDto[];
  rooms?: ApartmentRoomDto[];
};
export type PublicApartmentDto = Omit<AdminApartmentDto, "id" | "sourceLocked"> & {
  media: MediaAssetDto[];
  rooms?: ApartmentRoomDto[];
};
export type LeadDto = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  interestedIn: string | null;
  status: string;
  note: string | null;
  assignedToId: string | null;
  createdAt: string;
};
export type AuditLogDto = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  message: string | null;
  createdAt: string;
  admin?: { name: string; email: string } | null;
};
export type ApartmentRoomDto = {
  id: string;
  name: string;
  area: string | null;
  floorMaterial: string | null;
  sortOrder: number;
  sourceStatus: "VERIFIED" | "POTREBNA_PROVERA";
  sourceNote: string | null;
};
export type AdminUserDto = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "ADMIN" | "SALES" | "EDITOR";
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};
