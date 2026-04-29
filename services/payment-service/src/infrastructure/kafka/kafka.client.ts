import { Kafka } from "kafkajs";
import { env } from "../../config/env.js";

const kafka = new Kafka({
  clientId: "payment-service",
  brokers: env.KAFKA_BROKERS.split(",")
});

export const paymentProducer = kafka.producer();
