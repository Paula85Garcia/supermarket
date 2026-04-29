import Fastify from "fastify";
import { env } from "./config/env.js";
import { notificationRoutes } from "./interfaces/http/routes/notification.routes.js";

export const buildApp = () => {
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });
  app.register(notificationRoutes);
  app.setErrorHandler((error, _request, reply) => {
    reply.code(500).send({
      error: { code: "NOTIF_500", message: error.message || "Error interno en notification-service" }
    });
  });
  return app;
};
