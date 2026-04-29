import { deliveryConsumer } from "../../infrastructure/kafka/kafka.client.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { publishDeliveryEvent } from "../../infrastructure/kafka/event.publisher.js";

export const startFulfillmentReadyConsumer = async (): Promise<void> => {
  await deliveryConsumer.connect();
  await deliveryConsumer.subscribe({ topic: "fulfillment.task.ready" });
  await deliveryConsumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString()) as { payload?: { order_id?: string } };
      const orderId = event.payload?.order_id;
      if (!orderId) return;
      const delivery = await prisma.delivery.upsert({
        where: { orderId },
        update: {},
        create: {
          orderId,
          driverId: "pending-driver",
          status: "assigned",
          etaMinutes: 30
        }
      });
      await publishDeliveryEvent("delivery.order.assigned", { order_id: delivery.orderId, driver_id: delivery.driverId });
    }
  });
};
