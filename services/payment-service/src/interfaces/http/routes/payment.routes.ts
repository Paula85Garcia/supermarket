import type { FastifyInstance } from "fastify";
import {
  getPaymentByIdHandler,
  initiatePaymentHandler,
  nequiWebhookHandler,
  refundPaymentHandler,
  wompiWebhookHandler
} from "../handlers/payment.handlers.js";

export const paymentRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post("/payments/initiate", initiatePaymentHandler);
  app.post("/payments/wompi/webhook", wompiWebhookHandler);
  app.post("/payments/nequi/webhook", nequiWebhookHandler);
  app.get("/payments/:id", getPaymentByIdHandler);
  app.post("/payments/:id/refund", refundPaymentHandler);
};
