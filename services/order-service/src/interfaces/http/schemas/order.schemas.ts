import { z } from "zod";
import { OrderStatus } from "@supermarket/types";

const orderItemSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  unit_price: z.number().int().nonnegative()
});

export const createOrderSchema = z.object({
  customer_id: z.string().min(1),
  store_id: z.string().min(1),
  items: z.array(orderItemSchema).min(1)
});

export const orderIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const customerParamsSchema = z.object({
  id: z.string().min(1)
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus)
});
