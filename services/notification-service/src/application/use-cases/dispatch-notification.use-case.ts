import type { NotificationChannel } from "../../domain/entities/notification.entity.js";
import type { NotificationRepository } from "../../domain/repositories/notification.repository.js";

export class DispatchNotificationUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(input: {
    eventType: string;
    channel: NotificationChannel;
    recipient: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const log = await this.notificationRepository.createLog({
      event_type: input.eventType,
      channel: input.channel,
      recipient: input.recipient,
      payload: input.payload,
      status: "pending"
    });

    try {
      await this.simulateProviderDispatch(input.channel, input.recipient, input.payload);
      await this.notificationRepository.updateStatus(log.id, "sent", `${input.channel}-stub-ok`);
    } catch (error) {
      await this.notificationRepository.updateStatus(
        log.id,
        "failed",
        undefined,
        error instanceof Error ? error.message : "unknown_error"
      );
    }
  }

  private async simulateProviderDispatch(
    _channel: NotificationChannel,
    _recipient: string,
    _payload: Record<string, unknown>
  ): Promise<void> {
    return Promise.resolve();
  }
}
