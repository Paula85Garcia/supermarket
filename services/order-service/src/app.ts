import Fastify from "fastify";
import { env } from "./config/env.js";
import { orderRoutes } from "./interfaces/http/routes/order.routes.js";

export const buildApp = () => {
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });
  app.register(orderRoutes);
  app.setErrorHandler((error, _request, reply) => {
    reply.status(500).send({
      error: {
        code: "ORDER_500",
        message: error.message || "Error interno en order-service"
      }
    });
  });
  return app;
};
