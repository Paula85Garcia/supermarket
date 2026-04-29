import type { PaymentMethod } from "@supermarket/types";

export type PaymentStatus = "initiated" | "confirmed" | "failed" | "refunded";

export interface PaymentEntity {
  id: string;
  order_id: string;
  customer_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: "COP";
  gateway_ref?: string;
}
