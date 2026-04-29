import { Kafka } from "kafkajs";
import { env } from "../../config/env.js";

const kafka = new Kafka({
  clientId: "delivery-service",
  brokers: env.KAFKA_BROKERS.split(",")
});

export const deliveryProducer = kafka.producer();
export const deliveryConsumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID });
