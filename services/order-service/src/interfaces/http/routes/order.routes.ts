import type { FastifyInstance } from "fastify";
import {
  cancelOrderHandler,
  createOrderHandler,
  getOrderByIdHandler,
  getOrdersByCustomerHandler,
  storeQueueHandler,
  updateOrderStatusHandler
} from "../handlers/order.handlers.js";

export const orderRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post("/orders", createOrderHandler);
  app.get("/orders/:id", getOrderByIdHandler);
  app.get("/orders/customer/:id", getOrdersByCustomerHandler);
  app.put("/orders/:id/cancel", cancelOrderHandler);
  app.get("/orders/store/queue", storeQueueHandler);
  app.put("/orders/:id/status", updateOrderStatusHandler);
};
