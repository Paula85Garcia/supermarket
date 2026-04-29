import Fastify from "fastify";
import sensible from "@fastify/sensible";
import { env } from "./config/env.js";
import { authRoutes } from "./interfaces/http/routes/auth.routes.js";
import { AuthError } from "./infrastructure/http/errors.js";

export const buildApp = () => {
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });
  app.register(sensible);
  app.register(authRoutes);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AuthError) {
      reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
      return;
    }
    reply.status(500).send({
      error: {
        code: "AUTH_500",
        message: "Error interno de autenticacion"
      }
    });
  });

  return app;
};
