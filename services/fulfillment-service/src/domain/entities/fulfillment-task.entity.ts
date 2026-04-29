export interface FulfillmentTaskEntity {
  id: string;
  order_id: string;
  store_id: string;
  picker_id?: string;
  status: "assigned" | "accepted" | "ready" | "issue_reported";
}
