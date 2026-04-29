import type { OrderItem } from "../../domain/entities/order.entity.js";
import type { OrderRepository } from "../../domain/repositories/order.repository.js";
import { OrderSagaCoordinator } from "../sagas/order.saga.js";

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly saga: OrderSagaCoordinator
  ) {}

  async execute(input: {
    customerId: string;
    storeId: string;
    items: OrderItem[];
    totalAmount: number;
  }) {
    const order = await this.orderRepository.create({
      customerId: input.customerId,
      storeId: input.storeId,
      items: input.items,
      totalAmount: input.totalAmount
    });
    await this.saga.onOrderCreated(order.id, input.customerId, input.storeId);
    return order;
  }
}
