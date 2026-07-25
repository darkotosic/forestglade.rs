import { createApp } from "./app.js";
import { env } from "./env.js";
import { prisma } from "./prisma.js";

const server = createApp().listen(env.port, () =>
  console.log(`forestglade-api listening on ${env.port}`),
);

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
