import { Kafka } from "kafkajs";
import { env } from "../../config/env.js";

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: env.KAFKA_BROKERS.split(",")
});

export const notificationConsumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID });
