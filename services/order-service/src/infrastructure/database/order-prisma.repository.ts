import { OrderStatus } from "@supermarket/types";
import type { Prisma, PrismaOrderStatus } from "../../generated/prisma/index.js";
import { prisma } from "./prisma.js";
import type { CreateOrderInput, OrderRepository } from "../../domain/repositories/order.repository.js";
import type { OrderEntity } from "../../domain/entities/order.entity.js";

const toEntity = (order: {
  id: string;
  customerId: string;
  storeId: string;
  status: PrismaOrderStatus;
  totalAmount: number;
  currency: string;
  items: unknown;
  createdAt: Date;
  updatedAt: Date;
}): OrderEntity => ({
  id: order.id,
  customer_id: order.customerId,
  store_id: order.storeId,
  status: order.status as OrderStatus,
  total_amount: order.totalAmount,
  currency: "COP",
  items: order.items as OrderEntity["items"],
  created_at: order.createdAt,
  updated_at: order.updatedAt
});

export class PrismaOrderRepository implements OrderRepository {
  async create(input: CreateOrderInput): Promise<OrderEntity> {
    const created = await prisma.order.create({
      data: {
        customerId: input.customerId,
        storeId: input.storeId,
        totalAmount: input.totalAmount,
        items: input.items as unknown as Prisma.InputJsonValue
      }
    });
    return toEntity(created);
  }

  async findById(orderId: string): Promise<OrderEntity | null> {
    const row = await prisma.order.findUnique({ where: { id: orderId } });
    return row ? toEntity(row) : null;
  }

  async findByCustomer(customerId: string): Promise<OrderEntity[]> {
    const rows = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" }
    });
    return rows.map(toEntity);
  }

  async findStoreQueue(storeId: string): Promise<OrderEntity[]> {
    const rows = await prisma.order.findMany({
      where: { storeId, status: { in: ["confirmed", "preparing"] } },
      orderBy: { createdAt: "asc" }
    });
    return rows.map(toEntity);
  }

  async updateStatus(orderId: string, status: OrderEntity["status"]): Promise<OrderEntity | null> {
    const exists = await prisma.order.findUnique({ where: { id: orderId } });
    if (!exists) return null;
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as PrismaOrderStatus }
    });
    return toEntity(updated);
  }
}
