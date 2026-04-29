import type { DeliveryEntity } from "../entities/delivery.entity.js";

export interface DeliveryRepository {
  findByOrder(orderId: string): Promise<DeliveryEntity | null>;
}
