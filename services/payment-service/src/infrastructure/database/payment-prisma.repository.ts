import type { PrismaPaymentStatus } from "../../generated/prisma/index.js";
import type { PaymentEntity } from "../../domain/entities/payment.entity.js";
import type { InitiatePaymentInput, PaymentRepository } from "../../domain/repositories/payment.repository.js";
import { prisma } from "./prisma.js";

const toEntity = (row: {
  id: string;
  orderId: string;
  customerId: string;
  method: string;
  status: PrismaPaymentStatus;
  amount: number;
  currency: string;
  gatewayRef: string | null;
}): PaymentEntity => ({
  id: row.id,
  order_id: row.orderId,
  customer_id: row.customerId,
  method: row.method as PaymentEntity["method"],
  status: row.status as PaymentEntity["status"],
  amount: row.amount,
  currency: "COP",
  gateway_ref: row.gatewayRef ?? undefined
});

export class PrismaPaymentRepository implements PaymentRepository {
  async initiate(input: InitiatePaymentInput): Promise<PaymentEntity> {
    const row = await prisma.payment.create({
      data: {
        orderId: input.orderId,
        customerId: input.customerId,
        method: input.method,
        amount: input.amount,
        gatewayToken: input.gatewayToken
      }
    });
    return toEntity(row);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const row = await prisma.payment.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findByOrderId(orderId: string): Promise<PaymentEntity | null> {
    const row = await prisma.payment.findFirst({ where: { orderId } });
    return row ? toEntity(row) : null;
  }

  async updateStatus(id: string, status: PaymentEntity["status"], gatewayRef?: string): Promise<PaymentEntity | null> {
    const exists = await prisma.payment.findUnique({ where: { id } });
    if (!exists) return null;
    const row = await prisma.payment.update({
      where: { id },
      data: { status: status as PrismaPaymentStatus, gatewayRef }
    });
    return toEntity(row);
  }

  async createRefund(paymentId: string, amount: number, reason?: string): Promise<void> {
    await prisma.refund.create({ data: { paymentId, amount, reason } });
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "refunded" }
    });
  }
}
