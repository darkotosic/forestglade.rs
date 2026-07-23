import type { AdminRole, AdminUser } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { env } from "./env.js";
import { hashToken } from "./auth.js";
import { prisma } from "./prisma.js";

declare global {
  namespace Express {
    interface Request {
      admin?: Pick<AdminUser, "id" | "email" | "name" | "role" | "isActive">;
      adminSessionId?: string;
    }
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[env.sessionCookieName];
  if (!token) return res.status(401).json({ ok: false, message: "Niste prijavljeni." });
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: true },
  });
  if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.admin.isActive)
    return res.status(401).json({ ok: false, message: "Sesija je istekla." });
  req.admin = {
    id: session.admin.id,
    email: session.admin.email,
    name: session.admin.name,
    role: session.admin.role,
    isActive: session.admin.isActive,
  };
  req.adminSessionId = session.id;
  return next();
}

export function requireRole(roles: AdminRole[]) {
  return (req: Request, res: Response, next: NextFunction) =>
    req.admin && roles.includes(req.admin.role)
      ? next()
      : res.status(403).json({ ok: false, message: "Nemate dozvolu za ovu akciju." });
}
