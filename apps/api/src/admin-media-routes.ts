import express from "express";
import multer from "multer";
import { z } from "zod";
import { requireAdmin, requireRole } from "./admin-middleware.js";
import { logAudit } from "./audit.js";
import { cloudinary, getCloudinaryThumbnailUrl, getMediaFolder, uploadBuffer } from "./cloudinary.js";
import { ApiError, asyncHandler } from "./errors.js";
import { MAX_IMAGE_BYTES, validateImageFile } from "./media-validation.js";
import { prisma } from "./prisma.js";

export const adminMediaRouter = express.Router();
const writers = requireRole(["OWNER", "ADMIN", "EDITOR"]);
const deleters = requireRole(["OWNER", "ADMIN"]);
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } });
const bool = z.preprocess((value) => value === true || value === "true", z.boolean());
const placements = ["APARTMENT_CATALOG", "APARTMENT_GALLERY", "APARTMENT_PLAN", "INTERIOR", "VIRTUAL_TOUR"] as const;
const types = ["IMAGE", "RENDER", "FLOOR_PLAN"] as const;
export const apartmentImageMetadataSchema = z.object({
  title: z.string().trim().min(2).max(120), alt: z.string().trim().max(180).optional(), caption: z.string().trim().max(500).optional(),
  placement: z.enum(placements).default("APARTMENT_CATALOG"), type: z.enum(types).default("IMAGE"), isPublished: bool.default(false), isCover: bool.default(false),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
});
const patchSchema = apartmentImageMetadataSchema.partial();
const reorderSchema = z.object({ items: z.array(z.object({ id: z.string().min(1), sortOrder: z.number().int().min(0).max(10000) })).min(1).max(500) });

const publicMediaSelect = { id:true,title:true,alt:true,caption:true,secureUrl:true,thumbnailUrl:true,placement:true,type:true,isPublished:true,isCover:true,sortOrder:true,originalFilename:true,width:true,height:true,bytes:true,createdAt:true } as const;

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
    const media=await prisma.$transaction(async tx=>{ if(isCover) await tx.mediaAsset.updateMany({where:{apartmentId:apartment.id,isCover:true},data:{isCover:false}}); return tx.mediaAsset.create({data}); });
    await logAudit({adminId:req.admin?.id,action:"UPLOAD",entity:"MediaAsset",entityId:media.id,message:`Upload za ${apartment.code} (${apartment.slug}): ${req.file.originalname}`,afterJson:media,req});
    res.status(201).json({ok:true,media});
  } catch(error) { await cloudinary.uploader.destroy(uploaded.public_id,{resource_type:"image"}).catch(()=>undefined); throw error; }
}));

adminMediaRouter.patch("/media/:id",requireAdmin,writers,asyncHandler(async(req,res)=>{
  const before=await prisma.mediaAsset.findUnique({where:{id:String(req.params.id)}}); if(!before) throw new ApiError(404,"Slika nije pronađena.","MEDIA_NOT_FOUND");
  const data=patchSchema.parse(req.body);
  const finalPublished=data.isPublished??before.isPublished, finalAlt=data.alt??before.alt;
  if(finalPublished&&!finalAlt?.trim()) throw new ApiError(400,"Alt tekst je obavezan za objavu slika.","ALT_REQUIRED");
  const media=await prisma.$transaction(async tx=>{if(data.isCover&&before.apartmentId)await tx.mediaAsset.updateMany({where:{apartmentId:before.apartmentId,isCover:true,id:{not:before.id}},data:{isCover:false}});return tx.mediaAsset.update({where:{id:before.id},data});});
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
