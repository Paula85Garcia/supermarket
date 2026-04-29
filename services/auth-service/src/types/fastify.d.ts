import type { JWTPayload } from "@supermarket/types";

declare module "fastify" {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}
