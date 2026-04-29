import { randomUUID } from "crypto";
import type { BaseEvent } from "@supermarket/types";
import { orderProducer } from "./kafka.client.js";

export const publishEvent = async (eventType: string, payload: Record<string, unknown>): Promise<void> => {
  const event: BaseEvent = {
    event_id: randomUUID(),
    event_type: eventType,
    version: "1.0",
    timestamp: new Date().toISOString(),
    source_service: "order-service",
    payload
  };

  await orderProducer.send({
    topic: eventType,
    messages: [{ key: event.event_id, value: JSON.stringify(event) }]
  });
};
