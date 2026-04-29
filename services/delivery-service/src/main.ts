import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./infrastructure/database/prisma.js";
import { deliveryProducer } from "./infrastructure/kafka/kafka.client.js";
import { startFulfillmentReadyConsumer } from "./interfaces/events/fulfillment-ready.consumer.js";

const start = async (): Promise<void> => {
  await prisma.$connect();
  await deliveryProducer.connect();
  await startFulfillmentReadyConsumer();
  const app = buildApp();
  await app.listen({ host: "0.0.0.0", port: env.PORT });
};

start();
