import { z } from "zod";

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category_id: z.string().optional(),
  is_active: z.coerce.boolean().optional()
});

export const productIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const searchQuerySchema = z.object({
  q: z.string().min(1)
});

export const upsertProductSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
  images: z.array(z.string().url()).min(1),
  category_id: z.string().min(1),
  attributes: z.record(z.string()),
  is_active: z.boolean().default(true)
});
