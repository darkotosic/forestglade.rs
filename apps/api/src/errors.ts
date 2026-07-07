import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { env } from "./env.js";

export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public code = "API_ERROR") { super(message); }
}
export function asyncHandler<T extends Request>(handler: (req: T, res: Response, next: NextFunction) => Promise<unknown> | unknown) {
  return (req: T, res: Response, next: NextFunction) => Promise.resolve(handler(req, res, next)).catch(next);
}
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) { next(new ApiError(404, `Route not found: ${req.method} ${req.path}`, "NOT_FOUND")); }
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500, code = "INTERNAL_ERROR", message = "Internal server error";
  if (err instanceof ApiError) ({ statusCode, code, message } = err);
  else if (err instanceof ZodError) { statusCode = 400; code = "VALIDATION_ERROR"; message = "Podaci nisu ispravno popunjeni."; }
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") { statusCode = 404; code = "NOT_FOUND"; message = "Traženi zapis nije pronađen."; }
    if (err.code === "P2002") { statusCode = 409; code = "CONFLICT"; message = "Zapis već postoji."; }
  }
  if (statusCode >= 500) console.error(err);
  res.status(statusCode).json({ ok: false, code, message, ...(env.nodeEnv !== "production" && err instanceof Error ? { stack: err.stack } : {}) });
}
