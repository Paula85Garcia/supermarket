import type { FastifyInstance } from "fastify";
import {
  assignDeliveryHandler,
  confirmDeliveryHandler,
  getEtaHandler,
  updateLocationHandler,
  websocketTrackInfoHandler
} from "../handlers/delivery.handlers.js";

export const deliveryRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get("/delivery/track/:order_id", websocketTrackInfoHandler);
  app.post("/delivery/assign", assignDeliveryHandler);
  app.put("/delivery/location", updateLocationHandler);
  app.get("/delivery/eta/:order_id", getEtaHandler);
  app.post("/delivery/confirm/:order_id", confirmDeliveryHandler);
};
