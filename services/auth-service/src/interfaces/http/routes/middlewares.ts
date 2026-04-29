import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import type { JWTPayload } from "@supermarket/types";
import { env } from "../../../config/env.js";
import { authForbiddenError, authInvalidTokenError } from "../../../infrastructure/http/errors.js";

export const authenticate = async (request: FastifyRequest): Promise<void> => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw authInvalidTokenError();
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, env.JWT_PUBLIC_KEY, { algorithms: ["RS256"] }) as JWTPayload;
    request.user = payload;
  } catch {
    throw authInvalidTokenError();
  }
};

export const authorize =
  (roles: Array<JWTPayload["role"]>) =>
  async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = request.user as JWTPayload | undefined;
    if (!user || !roles.includes(user.role)) {
      throw authForbiddenError();
    }
  };
