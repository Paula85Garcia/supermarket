import type { FulfillmentTaskEntity } from "../entities/fulfillment-task.entity.js";

export interface FulfillmentRepository {
  findQueue(storeId: string): Promise<FulfillmentTaskEntity[]>;
}
