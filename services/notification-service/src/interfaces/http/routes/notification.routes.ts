import type { FastifyInstance } from "fastify";
import { healthHandler } from "../handlers/notification.handlers.js";

export const notificationRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get("/notifications/health", healthHandler);
};
