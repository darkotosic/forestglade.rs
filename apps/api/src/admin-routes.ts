import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import express from "express";
import multer from "multer";
import { z } from "zod";
import { clearSessionCookie, hashToken, newSessionToken, sessionExpiresAt, setSessionCookie } from "./auth.js";
import { logAudit } from "./audit.js";
import { uploadBuffer } from "./cloudinary.js";
import { env } from "./env.js";
import { requireAdmin, requireRole } from "./admin-middleware.js";
import { prisma } from "./prisma.js";

export const adminRouter = express.Router();
adminRouter.use(cookieParser());
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 300 * 1024 * 1024 } });
const roles = { manage: ["OWNER", "ADMIN"] as const, sales: ["OWNER", "ADMIN", "SALES"] as const };

adminRouter.post("/auth/bootstrap", async (req, res) => {
  if (!env.adminBootstrapToken || req.header("x-bootstrap-token") !== env.adminBootstrapToken) return res.status(401).json({ ok: false, message: "Unauthorized" });
  if (await prisma.adminUser.findFirst({ where: { role: "OWNER" } })) return res.status(409).json({ ok: false, message: "Owner already exists" });
  const body = z.object({ email: z.string().email(), name: z.string().min(2), password: z.string().min(10) }).parse(req.body);
  const admin = await prisma.adminUser.create({ data: { email: body.email.toLowerCase(), name: body.name, passwordHash: await bcrypt.hash(body.password, 12), role: "OWNER" } });
  await logAudit({ adminId: admin.id, action: "CREATE", entity: "AdminUser", entityId: admin.id, message: "Bootstrap OWNER admin", req });
  res.status(201).json({ ok: true });
});
adminRouter.post("/auth/login", async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const admin = await prisma.adminUser.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!admin || !admin.isActive || !(await bcrypt.compare(body.password, admin.passwordHash))) return res.status(401).json({ ok: false, message: "Email ili lozinka nisu ispravni." });
  const token = newSessionToken();
  await prisma.adminSession.create({ data: { tokenHash: hashToken(token), adminId: admin.id, expiresAt: sessionExpiresAt(), ipAddress: req.ip, userAgent: req.get("user-agent") } });
  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await logAudit({ adminId: admin.id, action: "LOGIN", entity: "AdminUser", entityId: admin.id, message: "Admin login", req });
  setSessionCookie(res, token); res.json({ ok: true, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
});
adminRouter.post("/auth/logout", requireAdmin, async (req, res) => { if (req.adminSessionId) await prisma.adminSession.update({ where: { id: req.adminSessionId }, data: { revokedAt: new Date() } }); await logAudit({ adminId: req.admin?.id, action: "LOGOUT", entity: "AdminSession", entityId: req.adminSessionId, req }); clearSessionCookie(res); res.json({ ok: true }); });
adminRouter.get("/auth/me", requireAdmin, (req, res) => res.json({ ok: true, admin: req.admin }));

adminRouter.get("/dashboard", requireAdmin, async (_req, res) => {
  const [totalLeads, newLeads, totalMedia, publishedMedia, byStatus, lastLeads, lastAuditLogs] = await Promise.all([prisma.lead.count(), prisma.lead.count({ where: { status: "NEW" } }), prisma.mediaAsset.count(), prisma.mediaAsset.count({ where: { isPublished: true } }), prisma.apartment.groupBy({ by: ["status"], _count: true }), prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 10 }), prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { admin: { select: { name: true, email: true } } } })]);
  res.json({ ok: true, totalLeads, newLeads, totalMedia, publishedMedia, apartmentsByStatus: byStatus, lastLeads, lastAuditLogs });
});
adminRouter.get("/apartments", requireAdmin, async (_req, res) => res.json({ ok: true, apartments: await prisma.apartment.findMany({ orderBy: { sortOrder: "asc" }, include: { media: true } }) }));
adminRouter.get("/apartments/:slug", requireAdmin, async (req, res) => { const apartment = await prisma.apartment.findUnique({ where: { slug: String(req.params.slug) }, include: { media: { orderBy: { sortOrder: "asc" } } } }); return apartment ? res.json({ ok: true, apartment }) : res.status(404).json({ ok: false }); });
adminRouter.patch("/apartments/:slug", requireAdmin, async (req, res) => {
  const before = await prisma.apartment.findUniqueOrThrow({ where: { slug: String(req.params.slug) } });
  const allowed = ["status","price","priceNote","shortDescription","description","seoTitle","seoDescription","isPublished"];
  const data: Record<string, unknown> = {}; for (const key of allowed) if (key in req.body) data[key] = req.body[key];
  const official = ["code","slug","floor","officialType","marketArea"].some((k) => k in req.body);
  if (official) { if (req.admin?.role !== "OWNER" || req.body.overrideOfficialFields !== true || !req.body.auditReason) return res.status(403).json({ ok:false, message:"Zvanična polja su zaključana." }); for (const key of ["code","slug","floor","officialType","marketArea"]) if (key in req.body) data[key]=req.body[key]; }
  const apartment = await prisma.apartment.update({ where: { slug: String(req.params.slug) }, data });
  await logAudit({ adminId: req.admin?.id, action: "UPDATE", entity: "Apartment", entityId: apartment.id, message: req.body.auditReason ?? "Izmena apartmana", beforeJson: before, afterJson: apartment, req });
  res.json({ ok: true, apartment });
});

adminRouter.get("/leads", requireAdmin, requireRole([...roles.sales]), async (req, res) => { const q=String(req.query.q??""); const status=req.query.status as any; const where:any={...(status?{status}:{}), ...(q?{OR:["name","phone","email","message"].map((f)=>({[f]:{contains:q,mode:"insensitive"}}))}:{})}; const page=Number(req.query.page??1), limit=Math.min(Number(req.query.limit??25),100); res.json({ ok:true, leads: await prisma.lead.findMany({ where, orderBy:{createdAt:"desc"}, skip:(page-1)*limit, take:limit }), total: await prisma.lead.count({ where }) }); });
adminRouter.get("/leads/:id", requireAdmin, requireRole([...roles.sales]), async (req,res)=>res.json({ok:true, lead: await prisma.lead.findUnique({where:{id:String(req.params.id)}})}));
adminRouter.patch("/leads/:id", requireAdmin, requireRole([...roles.sales]), async (req,res)=>{ const before=await prisma.lead.findUniqueOrThrow({where:{id:String(req.params.id)}}); const data:any={}; for(const k of ["status","note","assignedToId"]) if(k in req.body) data[k]=req.body[k]; const lead=await prisma.lead.update({where:{id:String(req.params.id)},data}); await logAudit({adminId:req.admin?.id,action:lead.status==="ARCHIVED"?"ARCHIVE":"UPDATE",entity:"Lead",entityId:lead.id,beforeJson:before,afterJson:lead,req}); res.json({ok:true,lead}); });
adminRouter.delete("/leads/:id", requireAdmin, requireRole([...roles.sales]), async (req,res)=>{ const before=await prisma.lead.findUniqueOrThrow({where:{id:String(req.params.id)}}); await prisma.lead.delete({where:{id:String(req.params.id)}}); await logAudit({adminId:req.admin?.id,action:"DELETE",entity:"Lead",entityId:String(req.params.id),beforeJson:before,req}); res.json({ok:true}); });

adminRouter.get("/media", requireAdmin, async (req,res)=>{ const apartmentSlug=String(req.query.apartmentSlug??""); const apt=apartmentSlug?await prisma.apartment.findUnique({where:{slug:apartmentSlug}}):null; res.json({ok:true, media: await prisma.mediaAsset.findMany({where:{...(apt?{apartmentId:apt.id}:{}), ...(req.query.placement?{placement:req.query.placement as any}:{}), ...(req.query.type?{type:req.query.type as any}:{}), ...(req.query.published?{isPublished:req.query.published==="true"}: {})}, include:{apartment:true}, orderBy:{createdAt:"desc"}})}); });
adminRouter.post("/media/upload", requireAdmin, upload.single("file"), async (req,res)=>{ if(!req.file) return res.status(400).json({ok:false,message:"Fajl je obavezan."}); const {title,type,placement,apartmentSlug,alt,caption}=req.body; if(!title||!type||!placement) return res.status(400).json({ok:false,message:"Naslov, tip i pozicija su obavezni."}); if(String(req.file.mimetype).startsWith("image/") && req.body.isPublished==="true" && !alt) return res.status(400).json({ok:false,message:"Alt tekst je obavezan za objavu slika."}); const apartment=apartmentSlug?await prisma.apartment.findUnique({where:{slug:apartmentSlug}}):null; const folder=`${env.cloudinary.folder}/${apartment?`apartments/${apartment.slug}`: placement==="HOME_HERO"?"home": placement==="EXTERIOR"?"exterior": placement==="INTERIOR"?"interior": placement==="VIRTUAL_TOUR"?"virtual-tours":"documents"}`; const resource=req.file.mimetype.startsWith("video/")?"video":req.file.mimetype==="application/pdf"?"raw":"image"; const up=await uploadBuffer(req.file.buffer,folder,resource); const media=await prisma.mediaAsset.create({data:{title,type,placement,alt,caption,apartmentId:apartment?.id,cloudinaryPublicId:up.public_id,secureUrl:up.secure_url,thumbnailUrl:up.secure_url,format:up.format,width:up.width,height:up.height,durationSeconds:up.duration?Math.round(up.duration):null,bytes:up.bytes,isPublished:req.body.isPublished==="true",createdById:req.admin?.id}}); await logAudit({adminId:req.admin?.id,action:"UPLOAD",entity:"MediaAsset",entityId:media.id,afterJson:media,req}); res.status(201).json({ok:true,media}); });
adminRouter.patch("/media/:id", requireAdmin, async (req,res)=>{ const before=await prisma.mediaAsset.findUniqueOrThrow({where:{id:String(req.params.id)}}); const data:any={}; for(const k of ["title","alt","caption","placement","type","sortOrder","isPublished"]) if(k in req.body) data[k]=req.body[k]; if(data.isPublished && (data.type??before.type)==="IMAGE" && !(data.alt??before.alt)) return res.status(400).json({ok:false,message:"Alt tekst je obavezan za objavu slika."}); const media=await prisma.mediaAsset.update({where:{id:String(req.params.id)},data}); await logAudit({adminId:req.admin?.id,action:"UPDATE",entity:"MediaAsset",entityId:media.id,beforeJson:before,afterJson:media,req}); res.json({ok:true,media}); });
adminRouter.delete("/media/:id", requireAdmin, async (req,res)=>{ const before=await prisma.mediaAsset.findUniqueOrThrow({where:{id:String(req.params.id)}}); await prisma.mediaAsset.delete({where:{id:String(req.params.id)}}); await logAudit({adminId:req.admin?.id,action:"DELETE",entity:"MediaAsset",entityId:String(req.params.id),beforeJson:before,req}); res.json({ok:true}); });
adminRouter.post("/media/reorder", requireAdmin, async(req,res)=>{ for(const item of req.body.items??[]) await prisma.mediaAsset.update({where:{id:item.id},data:{sortOrder:item.sortOrder}}); await logAudit({adminId:req.admin?.id,action:"UPDATE",entity:"MediaAsset",message:"Reorder media",afterJson:req.body,req}); res.json({ok:true}); });
adminRouter.get("/settings", requireAdmin, async(_req,res)=>res.json({ok:true,settings:await prisma.siteSetting.findMany({orderBy:{key:"asc"}})}));
adminRouter.patch("/settings", requireAdmin, requireRole([...roles.manage]), async(req,res)=>{ const changed=[]; for(const [key,value] of Object.entries(req.body)) changed.push(await prisma.siteSetting.upsert({where:{key},update:{value:value as any},create:{key,value:value as any}})); await logAudit({adminId:req.admin?.id,action:"UPDATE",entity:"SiteSetting",afterJson:req.body,req}); res.json({ok:true,settings:changed}); });
adminRouter.get("/audit", requireAdmin, requireRole([...roles.manage]), async(req,res)=>{ const page=Number(req.query.page??1), limit=Math.min(Number(req.query.limit??50),100); const where:any={...(req.query.entity?{entity:req.query.entity}:{}),...(req.query.adminId?{adminId:req.query.adminId}:{}),...(req.query.action?{action:req.query.action}: {})}; res.json({ok:true, logs:await prisma.auditLog.findMany({where,include:{admin:{select:{name:true,email:true}}},orderBy:{createdAt:"desc"},skip:(page-1)*limit,take:limit}), total: await prisma.auditLog.count({where})}); });
