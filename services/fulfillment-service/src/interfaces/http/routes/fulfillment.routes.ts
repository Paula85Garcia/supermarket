import type { FastifyInstance } from "fastify";
import {
  acceptTaskHandler,
  getItemsHandler,
  getQueueHandler,
  markReadyHandler,
  reportIssueHandler
} from "../handlers/fulfillment.handlers.js";

export const fulfillmentRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get("/fulfillment/queue", getQueueHandler);
  app.put("/fulfillment/:id/accept", acceptTaskHandler);
  app.put("/fulfillment/:id/ready", markReadyHandler);
  app.get("/fulfillment/:id/items", getItemsHandler);
  app.post("/fulfillment/:id/issue", reportIssueHandler);
};
