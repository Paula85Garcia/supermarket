export type NotificationChannel = "whatsapp" | "push" | "sms" | "email";

export interface NotificationEntity {
  id: string;
  event_type: string;
  channel: NotificationChannel;
  recipient: string;
  payload: Record<string, unknown>;
  status: "pending" | "sent" | "failed";
}
