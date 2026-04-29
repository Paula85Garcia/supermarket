import { orderConsumer } from "../../infrastructure/kafka/kafka.client.js";
import { OrderSagaCoordinator } from "../../application/sagas/order.saga.js";
import { PrismaOrderRepository } from "../../infrastructure/database/order-prisma.repository.js";

const saga = new OrderSagaCoordinator(new PrismaOrderRepository());

export const startOrderEventConsumer = async (): Promise<void> => {
  await orderConsumer.connect();
  await orderConsumer.subscribe({
    topics: ["inventory.stock.reserved", "payments.payment.confirmed", "payments.payment.failed", "delivery.order.delivered"]
  });

  await orderConsumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;
      const parsed = JSON.parse(message.value.toString()) as { payload?: { order_id?: string } };
      const orderId = parsed.payload?.order_id;
      if (!orderId) return;

      if (topic === "inventory.stock.reserved") await saga.onStockReserved(orderId);
      if (topic === "payments.payment.confirmed") await saga.onPaymentConfirmed(orderId);
      if (topic === "payments.payment.failed") await saga.onPaymentFailed(orderId);
      if (topic === "delivery.order.delivered") await saga.onDeliveryCompleted(orderId);
    }
  });
};
