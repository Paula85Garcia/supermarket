import Fastify from "fastify";
import { env } from "./config/env.js";
import { paymentRoutes } from "./interfaces/http/routes/payment.routes.js";

export const buildApp = () => {
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });
  app.register(paymentRoutes);
  app.setErrorHandler((error, _request, reply) => {
    if (error.name === "ZodError") {
      reply.code(400).send({
        error: { code: "PAY_400", message: "Payload invalido", details: error.message }
      });
      return;
    }
    reply.code(500).send({
      error: { code: "PAY_500", message: "Error interno de pagos" }
    });
  });
  return app;
};
