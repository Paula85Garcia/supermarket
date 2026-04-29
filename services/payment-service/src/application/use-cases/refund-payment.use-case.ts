import type { PaymentRepository } from "../../domain/repositories/payment.repository.js";
import { publishPaymentEvent } from "../../infrastructure/kafka/event.publisher.js";

export class RefundPaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(paymentId: string, amount: number, reason?: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) return null;
    await this.paymentRepository.createRefund(paymentId, amount, reason);
    await publishPaymentEvent("payments.payment.refunded", {
      payment_id: paymentId,
      order_id: payment.order_id,
      amount
    });
    return { payment_id: paymentId, refunded_amount: amount };
  }
}
