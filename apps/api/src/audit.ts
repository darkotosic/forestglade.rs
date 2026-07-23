import type { AuditAction, Prisma } from "@prisma/client";
import type { Request } from "express";
import { prisma } from "./prisma.js";

export async function logAudit(input: {
  adminId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  message?: string;
  beforeJson?: Prisma.InputJsonValue;
  afterJson?: Prisma.InputJsonValue;
  req?: Request;
}) {
  await prisma.auditLog.create({
    data: {
      adminId: input.adminId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      message: input.message,
      beforeJson: input.beforeJson,
      afterJson: input.afterJson,
      ipAddress: input.req?.ip,
      userAgent: input.req?.get("user-agent"),
    },
  });
}
