import type { FastifyInstance } from "fastify";
import {
  createAdminUserHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  registerHandler
} from "../handlers/auth.handlers.js";
import { authenticate, authorize } from "./middlewares.js";

export const authRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post("/auth/register", registerHandler);
  app.post("/auth/login", loginHandler);
  app.post("/auth/refresh", refreshHandler);
  app.post("/auth/logout", logoutHandler);
  app.get("/auth/me", { preHandler: [authenticate] }, meHandler);
  app.post(
    "/auth/admin/users",
    {
      preHandler: [authenticate, authorize(["superadmin"])]
    },
    createAdminUserHandler
  );
};
