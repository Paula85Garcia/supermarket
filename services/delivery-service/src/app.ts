import Fastify from "fastify";
import { env } from "./config/env.js";
import { deliveryRoutes } from "./interfaces/http/routes/delivery.routes.js";

export const buildApp = () => {
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });
  app.register(deliveryRoutes);
  app.setErrorHandler((error, _request, reply) => {
    if (error.name === "ZodError") {
      reply.code(400).send({ error: { code: "DEL_400", message: "Payload invalido", details: error.message } });
      return;
    }
    reply.code(500).send({ error: { code: "DEL_500", message: "Error interno en delivery-service" } });
  });
  return app;
};
