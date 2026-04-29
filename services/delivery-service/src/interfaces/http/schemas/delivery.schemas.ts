import { z } from "zod";

export const assignSchema = z.object({
  order_id: z.string().uuid(),
  driver_id: z.string().min(1)
});

export const locationSchema = z.object({
  order_id: z.string().uuid(),
  driver_id: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export const orderIdParamsSchema = z.object({
  order_id: z.string().uuid()
});
