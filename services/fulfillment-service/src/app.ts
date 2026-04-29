import Fastify from "fastify";
import { env } from "./config/env.js";
import { fulfillmentRoutes } from "./interfaces/http/routes/fulfillment.routes.js";

export const buildApp = () => {
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });
  app.register(fulfillmentRoutes);
  app.setErrorHandler((error, _request, reply) => {
    if (error.name === "ZodError") {
      reply.code(400).send({ error: { code: "FUL_400", message: "Payload invalido", details: error.message } });
      return;
    }
    reply.code(500).send({ error: { code: "FUL_500", message: "Error interno en fulfillment-service" } });
  });
  return app;
};
