import { PaymentMethod } from "@supermarket/types";
import type { PaymentRepository } from "../../domain/repositories/payment.repository.js";
import { publishPaymentEvent } from "../../infrastructure/kafka/event.publisher.js";

export class InitiatePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(input: {
    orderId: string;
    customerId: string;
    method: PaymentMethod;
    amount: number;
    gatewayToken?: string;
  }) {
    const payment = await this.paymentRepository.initiate({
      orderId: input.orderId,
      customerId: input.customerId,
      method: input.method,
      amount: input.amount,
      gatewayToken: input.gatewayToken
    });
    await publishPaymentEvent("payments.payment.initiated", {
      payment_id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      method: payment.method
    });
    return payment;
  }
}
