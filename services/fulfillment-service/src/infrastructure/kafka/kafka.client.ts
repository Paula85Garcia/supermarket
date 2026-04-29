import { Kafka } from "kafkajs";
import { env } from "../../config/env.js";

const kafka = new Kafka({
  clientId: "fulfillment-service",
  brokers: env.KAFKA_BROKERS.split(",")
});

export const fulfillmentProducer = kafka.producer();
export const fulfillmentConsumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID });
