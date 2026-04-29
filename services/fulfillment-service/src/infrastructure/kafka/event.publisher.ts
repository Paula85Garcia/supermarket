import { randomUUID } from "crypto";
import type { BaseEvent } from "@supermarket/types";
import { fulfillmentProducer } from "./kafka.client.js";

export const publishFulfillmentEvent = async (eventType: string, payload: Record<string, unknown>): Promise<void> => {
  const event: BaseEvent = {
    event_id: randomUUID(),
    event_type: eventType,
    version: "1.0",
    timestamp: new Date().toISOString(),
    source_service: "fulfillment-service",
    payload
  };

  await fulfillmentProducer.send({
    topic: eventType,
    messages: [{ key: event.event_id, value: JSON.stringify(event) }]
  });
};
