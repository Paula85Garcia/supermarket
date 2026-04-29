import { randomUUID } from "crypto";
import type { BaseEvent } from "@supermarket/types";
import { deliveryProducer } from "./kafka.client.js";

export const publishDeliveryEvent = async (eventType: string, payload: Record<string, unknown>): Promise<void> => {
  const event: BaseEvent = {
    event_id: randomUUID(),
    event_type: eventType,
    version: "1.0",
    timestamp: new Date().toISOString(),
    source_service: "delivery-service",
    payload
  };
  await deliveryProducer.send({
    topic: eventType,
    messages: [{ key: event.event_id, value: JSON.stringify(event) }]
  });
};
