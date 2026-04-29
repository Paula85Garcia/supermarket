import { notificationConsumer } from "../../infrastructure/kafka/kafka.client.js";
import { PrismaNotificationRepository } from "../../infrastructure/database/notification-prisma.repository.js";
import { DispatchNotificationUseCase } from "../../application/use-cases/dispatch-notification.use-case.js";

const dispatchUseCase = new DispatchNotificationUseCase(new PrismaNotificationRepository());

const topicChannelMap: Record<string, Array<"whatsapp" | "push" | "sms" | "email">> = {
  "orders.order.confirmed": ["push", "whatsapp"],
  "fulfillment.task.assigned": ["whatsapp"],
  "fulfillment.task.ready": ["whatsapp"],
  "delivery.order.assigned": ["push"],
  "delivery.location.updated": ["push", "sms"],
  "delivery.order.delivered": ["push", "email"],
  "payments.payment.failed": ["push", "whatsapp"],
  "inventory.stock.low_alert": ["whatsapp", "email"]
};

const topics = Object.keys(topicChannelMap);

export const startNotificationConsumer = async (): Promise<void> => {
  await notificationConsumer.connect();
  for (const topic of topics) {
    await notificationConsumer.subscribe({ topic });
  }

  await notificationConsumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString()) as { payload?: Record<string, unknown> };
      const channels = topicChannelMap[topic] ?? [];
      for (const channel of channels) {
        await dispatchUseCase.execute({
          eventType: topic,
          channel,
          recipient: "internal-recipient",
          payload: event.payload ?? {}
        });
      }
    }
  });
};
