import { OrderStatus } from "@supermarket/types";
import type { OrderRepository } from "../../domain/repositories/order.repository.js";
import { publishEvent } from "../../infrastructure/kafka/event.publisher.js";

export class CancelOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) return null;
    if ([OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED].includes(order.status)) {
      throw new Error("ORDER_002");
    }
    const updated = await this.orderRepository.updateStatus(orderId, OrderStatus.CANCELLED);
    await publishEvent("orders.order.cancelled", { order_id: orderId });
    return updated;
  }
}
