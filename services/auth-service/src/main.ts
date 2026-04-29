import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./infrastructure/database/prisma.js";

const start = async (): Promise<void> => {
  const app = buildApp();
  await prisma.$connect();
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
};

start();
