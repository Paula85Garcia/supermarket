import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { JWTPayload } from "@supermarket/types";
import { env } from "../../config/env.js";

export const signAccessToken = (payload: Omit<JWTPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, env.JWT_PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

export const signRefreshToken = (payload: Pick<JWTPayload, "sub" | "role" | "store_id" | "permissions">): string => {
  return jwt.sign(payload, env.JWT_PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
