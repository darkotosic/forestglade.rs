import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import express from "express";
import { z } from "zod";
import {
  clearSessionCookie,
  hashToken,
  newSessionToken,
  sessionExpiresAt,
  setSessionCookie,
  newSessionToken as newCsrfToken,
} from "./auth.js";
import { logAudit } from "./audit.js";
import { env } from "./env.js";
import { requireAdmin, requireRole } from "./admin-middleware.js";
import { prisma } from "./prisma.js";
import { ApiError } from "./errors.js";
import { adminMediaRouter } from "./admin-media-routes.js";

export const adminRouter = express.Router();
adminRouter.use(cookieParser());
const roles = { manage: ["OWNER", "ADMIN"] as const, sales: ["OWNER", "ADMIN", "SALES"] as const };
const csrfCookieName = "fg_csrf";
adminRouter.get("/auth/csrf", (_req, res) => {
  const token = newCsrfToken();
  res.cookie(csrfCookieName, token, {
    httpOnly: false,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  });
  res.json({ ok: true, token });
});
adminRouter.use((req, res, next) => {
  if (
    !["POST", "PATCH", "DELETE"].includes(req.method) ||
    ["/auth/login", "/auth/bootstrap"].includes(req.path)
  )
    return next();
  const cookieToken = req.cookies?.[csrfCookieName];
  if (!cookieToken || req.header("x-csrf-token") !== cookieToken)
    return res.status(403).json({ ok: false, message: "CSRF token nije ispravan." });
  next();
});

adminRouter.post("/auth/bootstrap", async (req, res) => {
  if (!env.adminBootstrapToken || req.header("x-bootstrap-token") !== env.adminBootstrapToken)
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  if (await prisma.adminUser.findFirst({ where: { role: "OWNER" } }))
    return res.status(409).json({ ok: false, message: "Owner already exists" });
  const body = z
    .object({ email: z.string().email(), name: z.string().min(2), password: z.string().min(10) })
    .parse(req.body);
  const admin = await prisma.adminUser.create({
    data: {
      email: body.email.toLowerCase(),
      name: body.name,
      passwordHash: await bcrypt.hash(body.password, 12),
      role: "OWNER",
    },
  });
  await logAudit({
    adminId: admin.id,
    action: "CREATE",
    entity: "AdminUser",
    entityId: admin.id,
    message: "Bootstrap OWNER admin",
    req,
  });
  res.status(201).json({ ok: true });
});
adminRouter.post("/auth/login", async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const admin = await prisma.adminUser.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!admin || !admin.isActive || !(await bcrypt.compare(body.password, admin.passwordHash)))
    return res.status(401).json({ ok: false, message: "Email ili lozinka nisu ispravni." });
  const token = newSessionToken();
  await prisma.adminSession.create({
    data: {
      tokenHash: hashToken(token),
      adminId: admin.id,
      expiresAt: sessionExpiresAt(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    },
  });
  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await logAudit({
    adminId: admin.id,
    action: "LOGIN",
    entity: "AdminUser",
    entityId: admin.id,
    message: "Admin login",
    req,
  });
  setSessionCookie(res, token);
  res.json({
    ok: true,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  });
});
adminRouter.post("/auth/logout", requireAdmin, async (req, res) => {
  if (req.adminSessionId)
    await prisma.adminSession.update({
      where: { id: req.adminSessionId },
      data: { revokedAt: new Date() },
    });
  await logAudit({
    adminId: req.admin?.id,
    action: "LOGOUT",
    entity: "AdminSession",
    entityId: req.adminSessionId,
    req,
  });
  clearSessionCookie(res);
  res.json({ ok: true });
});
adminRouter.get("/auth/me", requireAdmin, (req, res) => res.json({ ok: true, admin: req.admin }));

adminRouter.get("/dashboard", requireAdmin, async (_req, res) => {
  const [totalLeads, newLeads, totalMedia, publishedMedia, byStatus, lastLeads, lastAuditLogs] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.mediaAsset.count(),
      prisma.mediaAsset.count({ where: { isPublished: true } }),
      prisma.apartment.groupBy({ by: ["status"], _count: true }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { admin: { select: { name: true, email: true } } },
      }),
    ]);
  res.json({
    ok: true,
    totalLeads,
    newLeads,
    totalMedia,
    publishedMedia,
    apartmentsByStatus: byStatus,
    lastLeads,
    lastAuditLogs,
  });
});
adminRouter.get("/apartments", requireAdmin, async (_req, res) =>
  res.json({
    ok: true,
    apartments: await prisma.apartment.findMany({
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    }),
  }),
);
adminRouter.get("/apartments/:slug", requireAdmin, async (req, res) => {
  const apartment = await prisma.apartment.findUnique({
    where: { slug: String(req.params.slug) },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });
  return apartment ? res.json({ ok: true, apartment }) : res.status(404).json({ ok: false });
});
adminRouter.patch("/apartments/:slug", requireAdmin, async (req, res) => {
  const before = await prisma.apartment.findUniqueOrThrow({
    where: { slug: String(req.params.slug) },
  });
  const allowed = [
    "status",
    "price",
    "priceNote",
    "shortDescription",
    "description",
    "seoTitle",
    "seoDescription",
    "isPublished",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowed) if (key in req.body) data[key] = req.body[key];
  const official = ["code", "slug", "floor", "officialType", "marketArea"].some(
    (k) => k in req.body,
  );
  if (official) {
    if (
      req.admin?.role !== "OWNER" ||
      req.body.overrideOfficialFields !== true ||
      !req.body.auditReason
    )
      return res.status(403).json({ ok: false, message: "Zvanična polja su zaključana." });
    for (const key of ["code", "slug", "floor", "officialType", "marketArea"])
      if (key in req.body) data[key] = req.body[key];
  }
  const apartment = await prisma.apartment.update({
    where: { slug: String(req.params.slug) },
    data,
  });
  await logAudit({
    adminId: req.admin?.id,
    action: "UPDATE",
    entity: "Apartment",
    entityId: apartment.id,
    message: req.body.auditReason ?? "Izmena apartmana",
    beforeJson: before,
    afterJson: apartment,
    req,
  });
  res.json({ ok: true, apartment });
});

adminRouter.get("/leads", requireAdmin, requireRole([...roles.sales]), async (req, res) => {
  const q = String(req.query.q ?? "");
  const status = req.query.status as any;
  const where: any = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: ["name", "phone", "email", "message"].map((f) => ({
            [f]: { contains: q, mode: "insensitive" },
          })),
        }
      : {}),
  };
  const page = Number(req.query.page ?? 1),
    limit = Math.min(Number(req.query.limit ?? 25), 100);
  res.json({
    ok: true,
    leads: await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    total: await prisma.lead.count({ where }),
  });
});
adminRouter.get("/leads/:id", requireAdmin, requireRole([...roles.sales]), async (req, res) =>
  res.json({
    ok: true,
    lead: await prisma.lead.findUnique({ where: { id: String(req.params.id) } }),
  }),
);
adminRouter.patch("/leads/:id", requireAdmin, requireRole([...roles.sales]), async (req, res) => {
  const before = await prisma.lead.findUniqueOrThrow({ where: { id: String(req.params.id) } });
  const data: any = {};
  for (const k of ["status", "note", "assignedToId"]) if (k in req.body) data[k] = req.body[k];
  const lead = await prisma.lead.update({ where: { id: String(req.params.id) }, data });
  await logAudit({
    adminId: req.admin?.id,
    action: lead.status === "ARCHIVED" ? "ARCHIVE" : "UPDATE",
    entity: "Lead",
    entityId: lead.id,
    beforeJson: before,
    afterJson: lead,
    req,
  });
  res.json({ ok: true, lead });
});
adminRouter.delete("/leads/:id", requireAdmin, requireRole([...roles.sales]), async (req, res) => {
  const before = await prisma.lead.findUniqueOrThrow({ where: { id: String(req.params.id) } });
  await prisma.lead.delete({ where: { id: String(req.params.id) } });
  await logAudit({
    adminId: req.admin?.id,
    action: "DELETE",
    entity: "Lead",
    entityId: String(req.params.id),
    beforeJson: before,
    req,
  });
  res.json({ ok: true });
});

adminRouter.use(adminMediaRouter);
adminRouter.get("/settings", requireAdmin, async (_req, res) =>
  res.json({ ok: true, settings: await prisma.siteSetting.findMany({ orderBy: { key: "asc" } }) }),
);
adminRouter.patch("/settings", requireAdmin, requireRole([...roles.manage]), async (req, res) => {
  const changed = [];
  for (const [key, value] of Object.entries(req.body))
    changed.push(
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: value as never },
        create: { key, value: value as never },
      }),
    );
  await logAudit({
    adminId: req.admin?.id,
    action: "UPDATE",
    entity: "SiteSetting",
    afterJson: req.body,
    req,
  });
  res.json({ ok: true, settings: changed });
});

adminRouter.get("/users", requireAdmin, requireRole([...roles.manage]), async (_req, res) =>
  res.json({
    ok: true,
    users: await prisma.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
  }),
);
adminRouter.post("/users", requireAdmin, requireRole([...roles.manage]), async (req, res) => {
  const body = z
    .object({
      email: z.string().email(),
      name: z.string().min(2),
      password: z.string().min(10),
      role: z.enum(["OWNER", "ADMIN", "SALES", "EDITOR"]),
    })
    .parse(req.body);
  if (req.admin?.role !== "OWNER" && !["SALES", "EDITOR"].includes(body.role))
    throw new ApiError(403, "Nemate dozvolu za ovu rolu.", "FORBIDDEN");
  const user = await prisma.adminUser.create({
    data: {
      email: body.email.toLowerCase(),
      name: body.name,
      passwordHash: await bcrypt.hash(body.password, 12),
      role: body.role,
    },
  });
  await logAudit({
    adminId: req.admin?.id,
    action: "CREATE",
    entity: "AdminUser",
    entityId: user.id,
    afterJson: user,
    req,
  });
  res.status(201).json({ ok: true, user });
});
adminRouter.patch("/users/:id", requireAdmin, requireRole([...roles.manage]), async (req, res) => {
  const before = await prisma.adminUser.findUniqueOrThrow({ where: { id: String(req.params.id) } });
  if (req.admin?.role !== "OWNER" && before.role === "OWNER")
    throw new ApiError(403, "OWNER ne može biti izmenjen.", "FORBIDDEN");
  const body = z
    .object({
      name: z.string().min(2).optional(),
      role: z.enum(["OWNER", "ADMIN", "SALES", "EDITOR"]).optional(),
      isActive: z.boolean().optional(),
    })
    .parse(req.body);
  if (req.admin?.role !== "OWNER" && body.role && !["SALES", "EDITOR"].includes(body.role))
    throw new ApiError(403, "Nemate dozvolu za ovu rolu.", "FORBIDDEN");
  const user = await prisma.adminUser.update({ where: { id: String(req.params.id) }, data: body });
  await logAudit({
    adminId: req.admin?.id,
    action: "UPDATE",
    entity: "AdminUser",
    entityId: user.id,
    beforeJson: before,
    afterJson: user,
    req,
  });
  res.json({ ok: true, user });
});
adminRouter.post(
  "/users/:id/reset-password",
  requireAdmin,
  requireRole([...roles.manage]),
  async (req, res) => {
    const body = z.object({ password: z.string().min(10) }).parse(req.body);
    const user = await prisma.adminUser.update({
      where: { id: String(req.params.id) },
      data: { passwordHash: await bcrypt.hash(body.password, 12) },
    });
    await logAudit({
      adminId: req.admin?.id,
      action: "UPDATE",
      entity: "AdminUser",
      entityId: user.id,
      message: "Password reset",
      req,
    });
    res.json({ ok: true });
  },
);
adminRouter.patch(
  "/users/:id/deactivate",
  requireAdmin,
  requireRole([...roles.manage]),
  async (req, res) => {
    if (req.admin?.id === req.params.id)
      throw new ApiError(403, "Ne možete deaktivirati svoj nalog.", "FORBIDDEN");
    const before = await prisma.adminUser.findUniqueOrThrow({
      where: { id: String(req.params.id) },
    });
    if (req.admin?.role !== "OWNER" && before.role === "OWNER")
      throw new ApiError(403, "OWNER ne može biti deaktiviran.", "FORBIDDEN");
    const user = await prisma.adminUser.update({
      where: { id: String(req.params.id) },
      data: { isActive: false },
    });
    await logAudit({
      adminId: req.admin?.id,
      action: "UPDATE",
      entity: "AdminUser",
      entityId: user.id,
      message: "Deactivate user",
      beforeJson: before,
      afterJson: user,
      req,
    });
    res.json({ ok: true });
  },
);
adminRouter.get("/apartments/:slug/rooms", requireAdmin, async (req, res) => {
  const apt = await prisma.apartment.findUniqueOrThrow({
    where: { slug: String(req.params.slug) },
  });
  res.json({
    ok: true,
    rooms: await prisma.apartmentRoom.findMany({
      where: { apartmentId: apt.id },
      orderBy: { sortOrder: "asc" },
    }),
  });
});
adminRouter.post(
  "/apartments/:slug/rooms",
  requireAdmin,
  requireRole([...roles.manage]),
  async (req, res) => {
    const apt = await prisma.apartment.findUniqueOrThrow({
      where: { slug: String(req.params.slug) },
    });
    const body = z
      .object({
        name: z.string().min(1),
        area: z.string().optional().nullable(),
        floorMaterial: z.string().optional().nullable(),
        sortOrder: z.number().int().optional(),
        sourceStatus: z.enum(["VERIFIED", "POTREBNA_PROVERA"]).default("POTREBNA_PROVERA"),
        sourceNote: z.string().optional().nullable(),
      })
      .parse(req.body);
    const room = await prisma.apartmentRoom.create({ data: { ...body, apartmentId: apt.id } });
    await logAudit({
      adminId: req.admin?.id,
      action: "CREATE",
      entity: "ApartmentRoom",
      entityId: room.id,
      afterJson: room,
      req,
    });
    res.status(201).json({ ok: true, room });
  },
);
adminRouter.patch("/rooms/:id", requireAdmin, requireRole([...roles.manage]), async (req, res) => {
  const before = await prisma.apartmentRoom.findUniqueOrThrow({
    where: { id: String(req.params.id) },
  });
  const body = z
    .object({
      name: z.string().min(1).optional(),
      area: z.string().optional().nullable(),
      floorMaterial: z.string().optional().nullable(),
      sortOrder: z.number().int().optional(),
      sourceStatus: z.enum(["VERIFIED", "POTREBNA_PROVERA"]).optional(),
      sourceNote: z.string().optional().nullable(),
    })
    .parse(req.body);
  const room = await prisma.apartmentRoom.update({
    where: { id: String(req.params.id) },
    data: body,
  });
  await logAudit({
    adminId: req.admin?.id,
    action: "UPDATE",
    entity: "ApartmentRoom",
    entityId: room.id,
    beforeJson: before,
    afterJson: room,
    req,
  });
  res.json({ ok: true, room });
});
adminRouter.delete("/rooms/:id", requireAdmin, requireRole([...roles.manage]), async (req, res) => {
  const before = await prisma.apartmentRoom.findUniqueOrThrow({
    where: { id: String(req.params.id) },
  });
  await prisma.apartmentRoom.delete({ where: { id: String(req.params.id) } });
  await logAudit({
    adminId: req.admin?.id,
    action: "DELETE",
    entity: "ApartmentRoom",
    entityId: String(req.params.id),
    beforeJson: before,
    req,
  });
  res.json({ ok: true });
});
adminRouter.get("/audit", requireAdmin, requireRole([...roles.manage]), async (req, res) => {
  const page = Number(req.query.page ?? 1),
    limit = Math.min(Number(req.query.limit ?? 50), 100);
  const where: any = {
    ...(req.query.entity ? { entity: req.query.entity } : {}),
    ...(req.query.adminId ? { adminId: req.query.adminId } : {}),
    ...(req.query.action ? { action: req.query.action } : {}),
  };
  res.json({
    ok: true,
    logs: await prisma.auditLog.findMany({
      where,
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    total: await prisma.auditLog.count({ where }),
  });
});
