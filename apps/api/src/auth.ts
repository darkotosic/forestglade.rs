import crypto from "node:crypto";
import type { Response } from "express";
import { env } from "./env.js";

export function hashToken(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }
export function newSessionToken() { return crypto.randomBytes(48).toString("hex"); }
export function sessionExpiresAt() { return new Date(Date.now() + env.sessionDays * 24 * 60 * 60 * 1000); }
export function setSessionCookie(res: Response, token: string) {
  res.cookie(env.sessionCookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: env.sessionDays * 24 * 60 * 60 * 1000 });
}
export function clearSessionCookie(res: Response) { res.clearCookie(env.sessionCookieName, { path: "/" }); }
