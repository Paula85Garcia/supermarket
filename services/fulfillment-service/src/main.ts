import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./infrastructure/database/prisma.js";
import { fulfillmentProducer } from "./infrastructure/kafka/kafka.client.js";
import { startPaymentConfirmedConsumer } from "./interfaces/events/payment-confirmed.consumer.js";

const start = async (): Promise<void> => {
  await prisma.$connect();
  await fulfillmentProducer.connect();
  await startPaymentConfirmedConsumer();
  const app = buildApp();
  await app.listen({ host: "0.0.0.0", port: env.PORT });
};

start();
