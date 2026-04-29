import type { PaymentEntity } from "../entities/payment.entity.js";

export interface InitiatePaymentInput {
  orderId: string;
  customerId: string;
  method: string;
  amount: number;
  gatewayToken?: string;
}

export interface PaymentRepository {
  initiate(input: InitiatePaymentInput): Promise<PaymentEntity>;
  findById(id: string): Promise<PaymentEntity | null>;
  findByOrderId(orderId: string): Promise<PaymentEntity | null>;
  updateStatus(id: string, status: PaymentEntity["status"], gatewayRef?: string): Promise<PaymentEntity | null>;
  createRefund(paymentId: string, amount: number, reason?: string): Promise<void>;
}
