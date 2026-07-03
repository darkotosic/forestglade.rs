import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";
import { env } from "./env.js";
import { prisma } from "./prisma.js";
import { adminRouter } from "./admin-routes.js";
import { publicRouter } from "./public-routes.js";

const app = express();
app.set("trust proxy", 1);
const allowedOrigins = new Set(["http://localhost:3000", ...env.corsOrigins]);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
app.use(cors({ credentials: true, origin(origin, callback) { if (!origin || allowedOrigins.has(origin)) return callback(null, true); return callback(new Error("Origin not allowed by CORS")); } }));

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional(),
  interestedIn: z.string().trim().max(120).optional(),
  source: z.string().trim().max(80).optional().default("website"),
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "forestglade-api" }));

app.post("/api/leads", async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, message: "Podaci nisu ispravno popunjeni." });
  const { email, ...data } = parsed.data;
  const lead = await prisma.lead.create({ data: { ...data, email: email || undefined } });
  return res.status(201).json({ ok: true, leadId: lead.id });
});

app.use("/api/admin", adminRouter);
app.use("/api/public", publicRouter);

app.get("/api/leads", async (req, res) => {
  if (!env.leadsApiKey || req.header("x-api-key") !== env.leadsApiKey) return res.status(401).json({ ok: false, message: "Unauthorized" });
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return res.json({ ok: true, leads });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ ok: false, message: "Internal server error" });
});

app.listen(env.port, () => console.log(`forestglade-api listening on ${env.port}`));
