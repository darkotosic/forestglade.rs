import express from "express";
import multer from "multer";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdmin, requireRole } from "./admin-middleware.js";
import { logAudit } from "./audit.js";
import { cloudinary, getCloudinaryThumbnailUrl, getMediaFolder, uploadBuffer } from "./cloudinary.js";
import { env } from "./env.js";
import { ApiError, asyncHandler } from "./errors.js";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, isAllowedImageMime, isAllowedVideoFormat, validateImageFile } from "./media-validation.js";
import { prisma } from "./prisma.js";
import { resolveCloudinaryAsset, type CloudinarySourceInput } from "./cloudinary-asset-resolver.js";

export const adminMediaRouter = express.Router();
const writers = requireRole(["OWNER", "ADMIN", "EDITOR"]);
const deleters = requireRole(["OWNER", "ADMIN"]);
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } });
const bool = z.preprocess((value) => value === true || value === "true", z.boolean());
const placements = ["APARTMENT_CATALOG", "APARTMENT_GALLERY", "APARTMENT_PLAN", "INTERIOR", "VIRTUAL_TOUR"] as const;
const types = ["IMAGE", "VIDEO", "RENDER", "FLOOR_PLAN", "VIRTUAL_TOUR"] as const;
export const apartmentImageMetadataSchema = z.object({
  title: z.string().trim().min(2).max(120), alt: z.string().trim().max(180).optional(), caption: z.string().trim().max(500).optional(),
  placement: z.enum(placements).default("APARTMENT_CATALOG"), type: z.enum(types).default("IMAGE"), isPublished: bool.default(false), isCover: bool.default(false),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
});
const signSchema = z.object({ resourceType: z.enum(["image", "video"]) });
export const apartmentMediaMetadataSchema = z.object({
  title: z.string().trim().min(2).max(120),
  alt: z.string().trim().max(200).optional().nullable(),
  caption: z.string().trim().max(1000).optional().nullable(),
  type: z.enum(types),
  placement: z.enum(placements),
  isPublished: bool.default(false),
  isCover: bool.default(false),
}).superRefine((value, ctx) => {
  const resourceType = (ctx as unknown as { resourceType?: "image" | "video" }).resourceType;
  if (value.placement === "VIRTUAL_TOUR" && value.type !== "VIDEO" && value.type !== "VIRTUAL_TOUR") ctx.addIssue({ code: "custom", path: ["placement"], message: "Virtuelna šetnja zahteva video." });
  if (["APARTMENT_CATALOG", "APARTMENT_PLAN"].includes(value.placement) && ["VIDEO", "VIRTUAL_TOUR"].includes(value.type)) ctx.addIssue({ code: "custom", path: ["placement"], message: "Ovaj placement dozvoljava samo sliku." });
  if (value.isCover && ["VIDEO", "VIRTUAL_TOUR"].includes(value.type)) ctx.addIssue({ code: "custom", path: ["isCover"], message: "Video ne može biti naslovna slika." });
  if (["IMAGE", "RENDER", "FLOOR_PLAN"].includes(value.type) && value.isPublished && !value.alt?.trim()) ctx.addIssue({ code: "custom", path: ["alt"], message: "Alt tekst je obavezan za objavljenu sliku." });
  if (value.type === "FLOOR_PLAN" && !["APARTMENT_PLAN", "APARTMENT_CATALOG"].includes(value.placement)) ctx.addIssue({ code: "custom", path: ["placement"], message: "Osnova apartmana ide u osnovu ili kataloški prikaz." });
  if (resourceType === "image" && ["VIDEO", "VIRTUAL_TOUR"].includes(value.type)) ctx.addIssue({ code: "custom", path: ["type"], message: "Slika ne može imati video tip." });
  if (resourceType === "video" && !["VIDEO", "VIRTUAL_TOUR"].includes(value.type)) ctx.addIssue({ code: "custom", path: ["type"], message: "Video mora imati video tip." });
});
function parseMetadata(data: unknown, resourceType: "image" | "video") { return apartmentMediaMetadataSchema.superRefine((_, ctx) => { (ctx as unknown as { resourceType?: "image" | "video" }).resourceType = resourceType; }).parse(data); }
const cloudinarySourceSchema = z.object({ sourceKind: z.enum(["URL", "PUBLIC_ID"]), source: z.string().trim().min(1).max(1000), resourceType: z.enum(["auto", "image", "video"]) });
const importCloudinarySchema = cloudinarySourceSchema.and(apartmentMediaMetadataSchema);
const completeSchema = z.object({
  publicId: z.string().min(5).max(500), version: z.coerce.number().int().positive(), signature: z.string().min(10), resourceType: z.enum(["image", "video"]),
  originalFilename: z.string().min(1).max(255), title: z.string().trim().min(2).max(120), alt: z.string().trim().max(200).optional().nullable(), caption: z.string().trim().max(1000).optional().nullable(),
  type: z.enum(["IMAGE", "VIDEO", "RENDER", "FLOOR_PLAN", "VIRTUAL_TOUR"]), placement: z.enum(placements), isPublished: bool.default(false), isCover: bool.default(false),
});
const patchSchema = z.object({ title: z.string().trim().min(2).max(120).optional(), alt: z.string().trim().max(200).optional().nullable(), caption: z.string().trim().max(1000).optional().nullable(), placement: z.enum(placements).optional(), type: z.enum(types).optional(), sortOrder: z.coerce.number().int().min(0).max(10000).optional(), isPublished: bool.optional(), isCover: bool.optional() });
const reorderSchema = z.object({ items: z.array(z.object({ id: z.string().min(1), sortOrder: z.number().int().min(0).max(10000) })).min(1).max(500) });

const publicMediaSelect = { id:true,title:true,alt:true,caption:true,secureUrl:true,thumbnailUrl:true,placement:true,type:true,isPublished:true,isCover:true,sortOrder:true,originalFilename:true,cloudinaryResourceType:true,format:true,width:true,height:true,durationSeconds:true,bytes:true,createdAt:true,ingestMethod:true,cloudinaryAssetId:true,cloudinaryVersion:true,importSourceUrl:true,cloudinaryPublicId:true } as const;

adminMediaRouter.get("/apartments/options", requireAdmin, asyncHandler(async (_req, res) => {
  const apartments = await prisma.apartment.findMany({ orderBy:{sortOrder:"asc"}, select:{id:true,code:true,slug:true,floor:true} });
  res.json({ok:true,apartments});
}));

adminMediaRouter.get("/apartments/:slug/media", requireAdmin, asyncHandler(async (req,res) => {
  const apartment=await prisma.apartment.findUnique({where:{slug:String(req.params.slug)},select:{id:true}});
  if(!apartment) throw new ApiError(404,"Apartman nije pronađen.","APARTMENT_NOT_FOUND");
  const media=await prisma.mediaAsset.findMany({where:{apartmentId:apartment.id},orderBy:[{isCover:"desc"},{sortOrder:"asc"},{createdAt:"asc"}],select:publicMediaSelect});
  res.json({ok:true,media});
}));


adminMediaRouter.post("/apartments/:slug/media/sign", requireAdmin, writers, asyncHandler(async (req, res) => {
  const body = signSchema.parse(req.body);
  const apartment = await prisma.apartment.findUnique({ where: { slug: String(req.params.slug) } });
  if (!apartment) throw new ApiError(404, "Apartman nije pronađen.", "APARTMENT_NOT_FOUND");
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) throw new ApiError(500, "Cloudinary nije podešen.", "CLOUDINARY_NOT_CONFIGURED");
  const folder = `${env.cloudinary.folder}/apartments/${apartment.slug}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const uploadPreset = body.resourceType === "video" ? env.cloudinary.videoUploadPreset : env.cloudinary.imageUploadPreset;
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder, upload_preset: uploadPreset }, env.cloudinary.apiSecret);
  res.json({ ok: true, upload: { cloudName: env.cloudinary.cloudName, apiKey: env.cloudinary.apiKey, timestamp, signature, folder, resourceType: body.resourceType, uploadPreset } });
}));


adminMediaRouter.post("/apartments/:slug/media/resolve-cloudinary", requireAdmin, writers, asyncHandler(async (req, res) => {
  const input = cloudinarySourceSchema.parse(req.body) as CloudinarySourceInput;
  const asset = await resolveCloudinaryAsset(input);
  res.json({ ok: true, asset });
}));

adminMediaRouter.post("/apartments/:slug/media/import-cloudinary", requireAdmin, writers, asyncHandler(async (req, res) => {
  const input = cloudinarySourceSchema.parse(req.body) as CloudinarySourceInput;
  const apartment = await prisma.apartment.findUnique({ where: { slug: String(req.params.slug) } });
  if (!apartment) throw new ApiError(404, "Apartman nije pronađen.", "APARTMENT_NOT_FOUND");
  const resolved = await resolveCloudinaryAsset(input);
  const metadata = parseMetadata(req.body, resolved.resourceType);
  const existing = await prisma.mediaAsset.findFirst({ where: { OR: [{ cloudinaryAssetId: resolved.assetId ?? undefined }, { cloudinaryResourceType: resolved.resourceType, cloudinaryPublicId: resolved.publicId }] } });
  if (existing) throw new ApiError(409, "Ovaj Cloudinary fajl je već dodat u media biblioteku.", "MEDIA_ALREADY_LINKED");
  const media = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (metadata.isCover) await tx.mediaAsset.updateMany({ where: { apartmentId: apartment.id, isCover: true }, data: { isCover: false } });
    const lastMedia = await tx.mediaAsset.findFirst({ where: { apartmentId: apartment.id }, orderBy: { sortOrder: "desc" } });
    return tx.mediaAsset.create({ data: { ...metadata, alt: metadata.alt || null, caption: metadata.caption || null, apartmentId: apartment.id, cloudinaryPublicId: resolved.publicId, cloudinaryResourceType: resolved.resourceType, secureUrl: resolved.secureUrl, thumbnailUrl: resolved.thumbnailUrl, originalFilename: resolved.originalFilename, format: resolved.format, width: resolved.width, height: resolved.height, durationSeconds: resolved.durationSeconds, bytes: resolved.bytes, sortOrder: (lastMedia?.sortOrder ?? -1) + 1, isCover: metadata.isCover, ingestMethod: "CLOUDINARY_IMPORT", importSourceUrl: input.sourceKind === "URL" ? input.source : null, cloudinaryAssetId: resolved.assetId, cloudinaryVersion: resolved.version, createdById: req.admin?.id } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  await logAudit({ adminId: req.admin?.id, action: "UPLOAD", entity: "MediaAsset", entityId: media.id, message: `Cloudinary import za apartman ${apartment.code}`, afterJson: media, req });
  res.status(201).json({ ok: true, media });
}));

adminMediaRouter.post("/apartments/:slug/media/complete", requireAdmin, writers, asyncHandler(async (req, res) => {
  const body = completeSchema.parse(req.body);
  const apartment = await prisma.apartment.findUnique({ where: { slug: String(req.params.slug) } });
  if (!apartment) throw new ApiError(404, "Apartman nije pronađen.", "APARTMENT_NOT_FOUND");
  if (!env.cloudinary.apiSecret) throw new ApiError(500, "Cloudinary nije podešen.", "CLOUDINARY_NOT_CONFIGURED");
  if (["IMAGE", "RENDER", "FLOOR_PLAN"].includes(body.type) && body.isPublished && !body.alt?.trim()) throw new ApiError(400, "Alt tekst je obavezan za objavljenu sliku.", "ALT_REQUIRED");
  if (body.isCover && !["IMAGE", "RENDER"].includes(body.type)) throw new ApiError(400, "Video ne može biti cover.", "INVALID_COVER");
  const expectedPrefix = `${env.cloudinary.folder}/apartments/${apartment.slug}/`;
  if (!body.publicId.startsWith(expectedPrefix)) throw new ApiError(400, "Cloudinary fajl ne pripada izabranom apartmanu.", "INVALID_MEDIA_FOLDER");
  const expectedSignature = cloudinary.utils.api_sign_request({ public_id: body.publicId, version: body.version }, env.cloudinary.apiSecret);
  if (expectedSignature !== body.signature) throw new ApiError(400, "Cloudinary potpis nije ispravan.", "INVALID_CLOUDINARY_SIGNATURE");
  const resource = await cloudinary.api.resource(body.publicId, { resource_type: body.resourceType });
  const resourceFormat = String(resource.format ?? "").toLowerCase();
  const imageMime = resourceFormat === "jpg" ? "image/jpeg" : `image/${resourceFormat}`;
  if (body.resourceType === "image" && (!isAllowedImageMime(imageMime) || Number(resource.bytes ?? 0) > MAX_IMAGE_BYTES)) throw new ApiError(400, "Dozvoljeni formati su JPG, PNG, WEBP, AVIF, MP4, WEBM i MOV.", "INVALID_MEDIA_FORMAT");
  if (body.resourceType === "video" && (!isAllowedVideoFormat(resource.format) || Number(resource.bytes ?? 0) > MAX_VIDEO_BYTES)) throw new ApiError(400, "Video ne sme biti veći od 500 MB.", "INVALID_VIDEO");
  const media = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (body.isCover) await tx.mediaAsset.updateMany({ where: { apartmentId: apartment.id, isCover: true }, data: { isCover: false } });
    const lastMedia = await tx.mediaAsset.findFirst({ where: { apartmentId: apartment.id }, orderBy: { sortOrder: "desc" } });
    return tx.mediaAsset.create({ data: { apartmentId: apartment.id, title: body.title, alt: body.alt || null, caption: body.caption || null, type: body.type, placement: body.placement, cloudinaryPublicId: resource.public_id, cloudinaryResourceType: body.resourceType, secureUrl: resource.secure_url, thumbnailUrl: body.resourceType === "image" ? cloudinary.url(resource.public_id, { secure: true, width: 700, height: 700, crop: "limit", quality: "auto", fetch_format: "auto" }) : cloudinary.url(resource.public_id, { secure: true, resource_type: "video", format: "jpg", start_offset: "0", width: 800, height: 450, crop: "limit", quality: "auto" }), originalFilename: body.originalFilename, format: resource.format ?? null, width: resource.width ?? null, height: resource.height ?? null, durationSeconds: typeof resource.duration === "number" ? Math.round(resource.duration) : null, bytes: resource.bytes ?? null, sortOrder: (lastMedia?.sortOrder ?? -1) + 1, isPublished: body.isPublished, isCover: body.isCover, createdById: req.admin?.id } });
  });
  await logAudit({ adminId: req.admin?.id, action: "UPLOAD", entity: "MediaAsset", entityId: media.id, message: `Upload ${body.resourceType} za apartman ${apartment.code}`, afterJson: media, req });
  res.status(201).json({ ok: true, media });
}));

adminMediaRouter.post("/apartments/:slug/media/upload", requireAdmin, writers, imageUpload.single("file"), asyncHandler(async(req,res)=>{
  if(!req.file) throw new ApiError(400,"Fajl je obavezan.","FILE_REQUIRED");
  const apartment=await prisma.apartment.findUnique({where:{slug:String(req.params.slug)}});
  if(!apartment) throw new ApiError(404,"Apartman nije pronađen.","APARTMENT_NOT_FOUND");
  const meta=apartmentImageMetadataSchema.parse(req.body);
  if(meta.isPublished && !meta.alt?.trim()) throw new ApiError(400,"Alt tekst je obavezan za objavu slika.","ALT_REQUIRED");
  const detected=await validateImageFile(req.file);
  const uploaded=await uploadBuffer(req.file.buffer,getMediaFolder({apartmentSlug:apartment.slug,placement:meta.placement}),"image");
  const count=await prisma.mediaAsset.count({where:{apartmentId:apartment.id}});
  const isCover=meta.isCover || count===0;
  const data={...meta,alt:meta.alt||null,caption:meta.caption||null,apartmentId:apartment.id,cloudinaryPublicId:uploaded.public_id,secureUrl:uploaded.secure_url,thumbnailUrl:getCloudinaryThumbnailUrl(uploaded.public_id,"image"),format:detected.ext,width:uploaded.width,height:uploaded.height,bytes:uploaded.bytes,originalFilename:req.file.originalname,cloudinaryResourceType:"image",createdById:req.admin?.id,isCover};
  try {
    const media=await prisma.$transaction(async (tx: Prisma.TransactionClient)=>{ if(isCover) await tx.mediaAsset.updateMany({where:{apartmentId:apartment.id,isCover:true},data:{isCover:false}}); return tx.mediaAsset.create({data}); });
    await logAudit({adminId:req.admin?.id,action:"UPLOAD",entity:"MediaAsset",entityId:media.id,message:`Upload za ${apartment.code} (${apartment.slug}): ${req.file.originalname}`,afterJson:media,req});
    res.status(201).json({ok:true,media});
  } catch(error) { await cloudinary.uploader.destroy(uploaded.public_id,{resource_type:"image"}).catch(()=>undefined); throw error; }
}));

adminMediaRouter.patch("/media/:id",requireAdmin,writers,asyncHandler(async(req,res)=>{
  const before=await prisma.mediaAsset.findUnique({where:{id:String(req.params.id)}}); if(!before) throw new ApiError(404,"Slika nije pronađena.","MEDIA_NOT_FOUND");
  const data=patchSchema.parse(req.body);
  const finalPublished=data.isPublished??before.isPublished, finalAlt=data.alt??before.alt;
  if(["IMAGE","RENDER","FLOOR_PLAN"].includes(data.type??before.type)&&finalPublished&&!finalAlt?.trim()) throw new ApiError(400,"Alt tekst je obavezan za objavljenu sliku.","ALT_REQUIRED");
  if((data.isCover??false)&&["VIDEO","VIRTUAL_TOUR"].includes(data.type??before.type)) throw new ApiError(400,"Video ne može biti cover.","INVALID_COVER");
  const media=await prisma.$transaction(async (tx: Prisma.TransactionClient)=>{if(data.isCover&&before.apartmentId)await tx.mediaAsset.updateMany({where:{apartmentId:before.apartmentId,isCover:true,id:{not:before.id}},data:{isCover:false}});return tx.mediaAsset.update({where:{id:before.id},data});});
  const action=!before.isPublished&&media.isPublished?"PUBLISH":before.isPublished&&!media.isPublished?"UNPUBLISH":"UPDATE";
  await logAudit({adminId:req.admin?.id,action,entity:"MediaAsset",entityId:media.id,message:data.isCover?"Postavljena naslovna slika":"Izmena medija",beforeJson:before,afterJson:media,req});res.json({ok:true,media});
}));

adminMediaRouter.post("/apartments/:slug/media/reorder",requireAdmin,writers,asyncHandler(async(req,res)=>{
 const body=reorderSchema.parse(req.body); const apartment=await prisma.apartment.findUnique({where:{slug:String(req.params.slug)},select:{id:true,code:true}});if(!apartment)throw new ApiError(404,"Apartman nije pronađen.","APARTMENT_NOT_FOUND");
 const ids=[...new Set(body.items.map(x=>x.id))];if(ids.length!==body.items.length)throw new ApiError(400,"ID stavke se ne sme ponavljati.","INVALID_REORDER");
 const owned=await prisma.mediaAsset.count({where:{id:{in:ids},apartmentId:apartment.id}});if(owned!==ids.length)throw new ApiError(400,"Sve slike moraju pripadati izabranom apartmanu.","INVALID_REORDER");
 await prisma.$transaction(body.items.map(item=>prisma.mediaAsset.update({where:{id:item.id},data:{sortOrder:item.sortOrder}})));await logAudit({adminId:req.admin?.id,action:"UPDATE",entity:"MediaAsset",message:`Promenjen redosled za ${apartment.code}`,afterJson:body,req});res.json({ok:true});
}));

adminMediaRouter.delete("/media/:id",requireAdmin,deleters,asyncHandler(async(req,res)=>{const before=await prisma.mediaAsset.findUnique({where:{id:String(req.params.id)}});if(!before)throw new ApiError(404,"Slika nije pronađena.","MEDIA_NOT_FOUND");let result;try{result=await cloudinary.uploader.destroy(before.cloudinaryPublicId,{resource_type:before.cloudinaryResourceType as "image"|"video"|"raw"});}catch{throw new ApiError(502,"Cloudinary trenutno nije mogao da obriše sliku. Zapis je sačuvan; pokušajte ponovo.","CLOUDINARY_DELETE_FAILED");}if(!["ok","not found"].includes(result.result))throw new ApiError(502,"Cloudinary nije potvrdio brisanje. Zapis je sačuvan; pokušajte ponovo.","CLOUDINARY_DELETE_FAILED");await prisma.mediaAsset.delete({where:{id:before.id}});await logAudit({adminId:req.admin?.id,action:"DELETE",entity:"MediaAsset",entityId:before.id,message:`Obrisan Cloudinary asset ${before.originalFilename??before.title}`,beforeJson:before,req});res.json({ok:true});}));

adminMediaRouter.get("/media",requireAdmin,asyncHandler(async(req,res)=>{const apartmentSlug=typeof req.query.apartmentSlug==="string"?req.query.apartmentSlug:"";const apt=apartmentSlug?await prisma.apartment.findUnique({where:{slug:apartmentSlug}}):null;if(apartmentSlug&&!apt)throw new ApiError(404,"Apartman nije pronađen.","APARTMENT_NOT_FOUND");const q=typeof req.query.q==="string"?req.query.q.trim():"";const limit=Math.min(Number(req.query.limit)||100,100);const media=await prisma.mediaAsset.findMany({where:{...(apt?{apartmentId:apt.id}:{}),...(req.query.placement?{placement:req.query.placement as never}:{}),...(req.query.type?{type:req.query.type as never}:{}),...(req.query.published!==undefined?{isPublished:req.query.published==="true"}:{}),...(q?{title:{contains:q,mode:"insensitive"}}:{})},include:{apartment:{select:{code:true,slug:true}}},orderBy:{createdAt:"desc"},take:limit,skip:Number(req.query.offset)||0});res.json({ok:true,media,hasMore:media.length===limit});}));
