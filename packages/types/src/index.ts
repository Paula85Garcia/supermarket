export interface JWTPayload {
  sub: string;
  role: "customer" | "admin" | "picker" | "driver" | "superadmin";
  store_id: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export enum OrderStatus {
  PENDING = "pending",
  PAYMENT_PROCESSING = "payment_processing",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  READY = "ready",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  FAILED = "failed"
}

export enum PaymentMethod {
  WOMPI_CARD = "wompi_card",
  WOMPI_PSE = "wompi_pse",
  NEQUI = "nequi",
  DAVIPLATA = "daviplata",
  CASH = "cash"
}

export interface BaseEvent {
  event_id: string;
  event_type: string;
  version: "1.0";
  timestamp: string;
  source_service: string;
  payload: Record<string, unknown>;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category_id: string;
  attributes: Record<string, string>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface HttpSuccessResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface HttpErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type HttpResponse<T> = HttpSuccessResponse<T> | HttpErrorResponse;
