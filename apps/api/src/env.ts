import "dotenv/config";
import { z } from "zod";

const rawSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(10000),
    DATABASE_URL: z.string().optional(),
    CORS_ORIGIN: z.string().optional().default(""),
    LEADS_API_KEY: z.string().optional(),
    SESSION_COOKIE_NAME: z.string().optional().default("fg_admin_session"),
    SESSION_DAYS: z.coerce.number().int().positive().default(7),
    ADMIN_BOOTSTRAP_TOKEN: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    CLOUDINARY_FOLDER: z.string().optional().default("forestglade"),
    CLOUDINARY_IMAGE_UPLOAD_PRESET: z.string().optional().default("forestglade-admin-images"),
    CLOUDINARY_VIDEO_UPLOAD_PRESET: z.string().optional().default("forestglade-admin-videos"),
    SALES_NOTIFICATION_EMAIL: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== "production") return;
    for (const key of [
      "DATABASE_URL",
      "CORS_ORIGIN",
      "ADMIN_BOOTSTRAP_TOKEN",
      "SESSION_COOKIE_NAME",
      "SESSION_DAYS",
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
      "CLOUDINARY_FOLDER",
    ] as const) {
      if (!value[key])
        ctx.addIssue({ code: "custom", path: [key], message: "Required in production" });
    }
  });

const parsed = rawSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
const raw = parsed.data;
export const env = {
  nodeEnv: raw.NODE_ENV,
  port: raw.PORT,
  databaseUrl: raw.DATABASE_URL,
  corsOrigins: raw.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  leadsApiKey: raw.LEADS_API_KEY,
  sessionCookieName: raw.SESSION_COOKIE_NAME,
  sessionDays: raw.SESSION_DAYS,
  adminBootstrapToken: raw.ADMIN_BOOTSTRAP_TOKEN,
  smtp: {
    host: raw.SMTP_HOST,
    port: raw.SMTP_PORT ?? 587,
    user: raw.SMTP_USER,
    pass: raw.SMTP_PASS,
    from: raw.SMTP_FROM,
    salesTo: raw.SALES_NOTIFICATION_EMAIL,
  },
  cloudinary: {
    cloudName: raw.CLOUDINARY_CLOUD_NAME,
    apiKey: raw.CLOUDINARY_API_KEY,
    apiSecret: raw.CLOUDINARY_API_SECRET,
    folder: raw.CLOUDINARY_FOLDER,
    imageUploadPreset: raw.CLOUDINARY_IMAGE_UPLOAD_PRESET,
    videoUploadPreset: raw.CLOUDINARY_VIDEO_UPLOAD_PRESET,
  },
};
