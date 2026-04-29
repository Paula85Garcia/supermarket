import type { PaymentRepository } from "../../domain/repositories/payment.repository.js";
import { publishPaymentEvent } from "../../infrastructure/kafka/event.publisher.js";

export class FailPaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(paymentId: string, reason?: string) {
    const updated = await this.paymentRepository.updateStatus(paymentId, "failed");
    if (!updated) return null;
    await publishPaymentEvent("payments.payment.failed", {
      payment_id: updated.id,
      order_id: updated.order_id,
      reason
    });
    return updated;
  }
}
