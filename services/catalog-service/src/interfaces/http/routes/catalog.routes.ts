import type { FastifyInstance } from "fastify";
import {
  createProductHandler,
  getProductByIdHandler,
  listCategoriesHandler,
  listProductsHandler,
  searchProductsHandler,
  updateProductHandler
} from "../handlers/catalog.handlers.js";
import { authenticate, authorizeAdmin } from "./middlewares.js";

export const catalogRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get("/products", listProductsHandler);
  app.get("/products/:id", getProductByIdHandler);
  app.get("/products/search", searchProductsHandler);
  app.get("/categories", listCategoriesHandler);
  app.post("/products", { preHandler: [authenticate, authorizeAdmin] }, createProductHandler);
  app.put("/products/:id", { preHandler: [authenticate, authorizeAdmin] }, updateProductHandler);
};
