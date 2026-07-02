import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 10000),
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: (process.env.CORS_ORIGIN ?? "").split(",").map((origin) => origin.trim()).filter(Boolean),
  leadsApiKey: process.env.LEADS_API_KEY,
};
