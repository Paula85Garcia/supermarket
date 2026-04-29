import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./infrastructure/database/prisma.js";
import { startNotificationConsumer } from "./interfaces/events/notification.consumer.js";

const start = async (): Promise<void> => {
  await prisma.$connect();
  await startNotificationConsumer();
  const app = buildApp();
  await app.listen({ host: "0.0.0.0", port: env.PORT });
};

start();
