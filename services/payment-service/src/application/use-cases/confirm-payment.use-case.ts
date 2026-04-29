import type { PaymentRepository } from "../../domain/repositories/payment.repository.js";
import { publishPaymentEvent } from "../../infrastructure/kafka/event.publisher.js";

export class ConfirmPaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(paymentId: string, gatewayRef?: string) {
    const updated = await this.paymentRepository.updateStatus(paymentId, "confirmed", gatewayRef);
    if (!updated) return null;
    await publishPaymentEvent("payments.payment.confirmed", {
      payment_id: updated.id,
      order_id: updated.order_id
    });
    return updated;
  }
}
