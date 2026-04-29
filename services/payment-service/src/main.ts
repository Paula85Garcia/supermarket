import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./infrastructure/database/prisma.js";
import { paymentProducer } from "./infrastructure/kafka/kafka.client.js";

const start = async (): Promise<void> => {
  await prisma.$connect();
  await paymentProducer.connect();
  const app = buildApp();
  await app.listen({ host: "0.0.0.0", port: env.PORT });
};

start();
