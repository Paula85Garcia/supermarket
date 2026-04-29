import Fastify from "fastify";
import { env } from "./config/env.js";
import { catalogRoutes } from "./interfaces/http/routes/catalog.routes.js";

export const buildApp = () => {
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });
  app.register(catalogRoutes);
  return app;
};
