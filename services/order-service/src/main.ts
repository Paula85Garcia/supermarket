import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./infrastructure/database/prisma.js";
import { orderProducer } from "./infrastructure/kafka/kafka.client.js";
import { startOrderEventConsumer } from "./interfaces/events/order-events.consumer.js";

const start = async (): Promise<void> => {
  await prisma.$connect();
  await orderProducer.connect();
  await startOrderEventConsumer();
  const app = buildApp();
  await app.listen({ host: "0.0.0.0", port: env.PORT });
};

start();
