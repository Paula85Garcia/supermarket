export interface DeliveryEntity {
  id: string;
  order_id: string;
  driver_id: string;
  status: "assigned" | "picked_up" | "in_transit" | "delivered";
  eta_minutes: number;
}
