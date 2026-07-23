import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";
import { adminRouter } from "./admin-routes.js";
import { env } from "./env.js";
import { asyncHandler, errorHandler, notFoundHandler } from "./errors.js";
import { sendLeadNotification } from "./mail.js";
import { prisma } from "./prisma.js";
import { publicRouter } from "./public-routes.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = new Set(["http://localhost:3000", ...env.corsOrigins]);
const makeLimiter = (windowMs: number, max: number) =>
  rateLimit({ windowMs, limit: max, standardHeaders: true, legacyHeaders: false });

const authLimiter = makeLimiter(15 * 60 * 1000, 5);
const leadLimiter = makeLimiter(10 * 60 * 1000, 10);
const adminLimiter = makeLimiter(15 * 60 * 1000, 300);
const publicLimiter = makeLimiter(15 * 60 * 1000, 500);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
  }),
);

const interests = [
  "Kupovina apartmana",
  "Investicija",
  "Zakazivanje prezentacije",
  "Opšti upit",
] as const;

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional(),
  interestedIn: z.enum(interests).optional(),
  source: z.string().trim().max(80).optional().default("website"),
  consentAccepted: z.literal(true),
  companyWebsite: z.string().optional(),
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "forestglade-api" }));
app.post(
  "/api/leads",
  leadLimiter,
  asyncHandler(async (req, res) => {
    const parsed = leadSchema.parse(req.body);
    if (parsed.companyWebsite?.trim()) return res.json({ ok: true });
    const { email, companyWebsite: _honeypot, ...data } = parsed;
    const lead = await prisma.lead.create({
      data: {
        ...data,
        phone: data.phone.trim(),
        email: email ? email.toLowerCase() : undefined,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
    });
    await sendLeadNotification(lead);
    return res.status(201).json({ ok: true, leadId: lead.id });
  }),
);
app.use("/api/admin/auth/login", authLimiter);
app.use("/api/admin/auth/bootstrap", authLimiter);
app.use("/api/admin", adminLimiter, adminRouter);
app.use("/api/public", publicLimiter, publicRouter);
app.get(
  "/api/leads",
  asyncHandler(async (req, res) => {
    if (!env.leadsApiKey || req.header("x-api-key") !== env.leadsApiKey) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }
    return res.json({
      ok: true,
      leads: await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    });
  }),
);
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.port, () => console.log(`forestglade-api listening on ${env.port}`));

const shutdown = (signal: "SIGTERM" | "SIGINT") => {
  console.log(`${signal} received, shutting down forestglade-api`);
  const timeout = setTimeout(() => {
    console.error("Graceful shutdown timed out; forcing process exit");
    process.exit(1);
  }, 10_000);
  timeout.unref();

  server.close(async (error) => {
    if (error) {
      console.error("HTTP server shutdown failed", error);
      process.exitCode = 1;
    }
    await prisma.$disconnect();
    process.exit();
  });
};

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
