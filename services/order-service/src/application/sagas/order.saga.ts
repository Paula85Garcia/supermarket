import { OrderStatus } from "@supermarket/types";
import { publishEvent } from "../../infrastructure/kafka/event.publisher.js";
import type { OrderRepository } from "../../domain/repositories/order.repository.js";

export class OrderSagaCoordinator {
  constructor(private readonly orderRepository: OrderRepository) {}

  async onOrderCreated(orderId: string, customerId: string, storeId: string): Promise<void> {
    await publishEvent("orders.order.created", { order_id: orderId, customer_id: customerId, store_id: storeId });
  }

  async onStockReserved(orderId: string): Promise<void> {
    await this.orderRepository.updateStatus(orderId, OrderStatus.PAYMENT_PROCESSING);
    await publishEvent("payments.payment.initiated", { order_id: orderId });
  }

  async onPaymentConfirmed(orderId: string): Promise<void> {
    await this.orderRepository.updateStatus(orderId, OrderStatus.CONFIRMED);
    await publishEvent("orders.order.confirmed", { order_id: orderId });
    await publishEvent("fulfillment.task.assigned", { order_id: orderId });
  }

  async onPaymentFailed(orderId: string): Promise<void> {
    await this.orderRepository.updateStatus(orderId, OrderStatus.FAILED);
    await publishEvent("orders.order.failed", { order_id: orderId });
    await publishEvent("inventory.stock.released", { order_id: orderId });
  }

  async onDeliveryCompleted(orderId: string): Promise<void> {
    await this.orderRepository.updateStatus(orderId, OrderStatus.DELIVERED);
    await publishEvent("delivery.order.delivered", { order_id: orderId });
  }
}
