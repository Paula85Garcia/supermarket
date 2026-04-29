import { fulfillmentConsumer } from "../../infrastructure/kafka/kafka.client.js";
import { prisma } from "../../infrastructure/database/prisma.js";

export const startPaymentConfirmedConsumer = async (): Promise<void> => {
  await fulfillmentConsumer.connect();
  await fulfillmentConsumer.subscribe({ topic: "payments.payment.confirmed" });
  await fulfillmentConsumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString()) as { payload?: { order_id?: string; store_id?: string } };
      const orderId = event.payload?.order_id;
      if (!orderId) return;
      await prisma.fulfillmentTask.upsert({
        where: { orderId },
        update: {},
        create: {
          orderId,
          storeId: event.payload?.store_id ?? "main-store",
          status: "assigned"
        }
      });
    }
  });
};
