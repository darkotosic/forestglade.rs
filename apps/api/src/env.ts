import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 10000),
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: (process.env.CORS_ORIGIN ?? "").split(",").map((origin) => origin.trim()).filter(Boolean),
  leadsApiKey: process.env.LEADS_API_KEY,
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "fg_admin_session",
  sessionDays: Number(process.env.SESSION_DAYS ?? 7),
  adminBootstrapToken: process.env.ADMIN_BOOTSTRAP_TOKEN,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER ?? "forestglade",
  },
};
