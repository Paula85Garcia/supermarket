import { PaymentMethod } from "@supermarket/types";
import { z } from "zod";

export const initiatePaymentSchema = z.object({
  order_id: z.string().uuid(),
  customer_id: z.string().min(1),
  method: z.nativeEnum(PaymentMethod),
  amount: z.number().int().positive(),
  gateway_token: z.string().optional()
});

export const paymentIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const refundSchema = z.object({
  amount: z.number().int().positive(),
  reason: z.string().optional()
});

export const wompiWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    transaction: z.object({
      id: z.string(),
      reference: z.string(),
      status: z.enum(["APPROVED", "DECLINED", "ERROR"])
    })
  }),
  signature: z.object({
    properties: z.array(z.string()),
    checksum: z.string()
  }),
  timestamp: z.number()
});

export const nequiWebhookSchema = z.object({
  transaction_id: z.string(),
  order_id: z.string().uuid(),
  status: z.enum(["APPROVED", "DECLINED", "ERROR"])
});
