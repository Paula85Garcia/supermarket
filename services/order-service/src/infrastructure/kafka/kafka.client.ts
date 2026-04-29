import { Kafka } from "kafkajs";
import { env } from "../../config/env.js";

export const kafka = new Kafka({
  clientId: "order-service",
  brokers: env.KAFKA_BROKERS.split(",")
});

export const orderProducer = kafka.producer();
export const orderConsumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID });
