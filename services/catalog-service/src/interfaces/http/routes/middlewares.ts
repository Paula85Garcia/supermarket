import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import type { JWTPayload } from "@supermarket/types";
import { env } from "../../../config/env.js";

export const authenticate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    reply.code(401).send({ error: { code: "AUTH_001", message: "Token invalido o expirado" } });
    return;
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    request.user = jwt.verify(token, env.JWT_PUBLIC_KEY, { algorithms: ["RS256"] }) as JWTPayload;
  } catch {
    reply.code(401).send({ error: { code: "AUTH_001", message: "Token invalido o expirado" } });
  }
};

export const authorizeAdmin = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const role = request.user?.role;
  if (!role || !["admin", "superadmin"].includes(role)) {
    reply.code(403).send({ error: { code: "AUTH_002", message: "Permisos insuficientes" } });
  }
};
