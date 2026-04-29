import type { OrderEntity, OrderItem } from "../entities/order.entity.js";

export interface CreateOrderInput {
  customerId: string;
  storeId: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface OrderRepository {
  create(input: CreateOrderInput): Promise<OrderEntity>;
  findById(orderId: string): Promise<OrderEntity | null>;
  findByCustomer(customerId: string): Promise<OrderEntity[]>;
  findStoreQueue(storeId: string): Promise<OrderEntity[]>;
  updateStatus(orderId: string, status: OrderEntity["status"]): Promise<OrderEntity | null>;
}
