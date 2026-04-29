import type { NotificationEntity } from "../entities/notification.entity.js";

export interface NotificationRepository {
  createLog(input: Omit<NotificationEntity, "id">): Promise<NotificationEntity>;
  updateStatus(id: string, status: NotificationEntity["status"], providerRef?: string, errorMessage?: string): Promise<void>;
}
