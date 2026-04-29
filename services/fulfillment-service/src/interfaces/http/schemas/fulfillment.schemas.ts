import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().uuid()
});

export const queueQuerySchema = z.object({
  store_id: z.string().min(1)
});

export const acceptSchema = z.object({
  picker_id: z.string().min(1)
});

export const issueSchema = z.object({
  reason: z.string().min(3)
});
