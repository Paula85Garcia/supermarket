import type { Product } from "@supermarket/types";

export interface ProductRepository {
  list(page: number, limit: number): Promise<{ data: Product[]; total: number }>;
}
