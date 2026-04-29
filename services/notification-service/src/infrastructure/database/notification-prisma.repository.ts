import type { NotificationEntity } from "../../domain/entities/notification.entity.js";
import type { NotificationRepository } from "../../domain/repositories/notification.repository.js";
import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "./prisma.js";

const toEntity = (row: {
  id: string;
  eventType: string;
  channel: "whatsapp" | "push" | "sms" | "email";
  recipient: string;
  payload: unknown;
  status: "pending" | "sent" | "failed";
}): NotificationEntity => ({
  id: row.id,
  event_type: row.eventType,
  channel: row.channel,
  recipient: row.recipient,
  payload: row.payload as Record<string, unknown>,
  status: row.status
});

export class PrismaNotificationRepository implements NotificationRepository {
  async createLog(input: Omit<NotificationEntity, "id">): Promise<NotificationEntity> {
    const row = await prisma.notificationLog.create({
      data: {
        eventType: input.event_type,
        channel: input.channel,
        recipient: input.recipient,
        payload: input.payload as Prisma.InputJsonValue,
        status: input.status
      }
    });
    return toEntity(row);
  }

  async updateStatus(id: string, status: NotificationEntity["status"], providerRef?: string, errorMessage?: string): Promise<void> {
    await prisma.notificationLog.update({
      where: { id },
      data: {
        status,
        providerRef,
        errorMessage
      }
    });
  }
}
