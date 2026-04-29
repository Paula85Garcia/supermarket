import type { OrderStatus } from "@supermarket/types";

export interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface OrderEntity {
  id: string;
  customer_id: string;
  store_id: string;
  status: OrderStatus;
  total_amount: number;
  currency: "COP";
  items: OrderItem[];
  created_at: Date;
  updated_at: Date;
}
