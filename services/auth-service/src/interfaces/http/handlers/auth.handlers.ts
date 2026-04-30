import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import type { UserPermission } from "../../../generated/prisma/index.js";
import { prisma } from "../../../infrastructure/database/prisma.js";
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  signPasswordResetToken,
  signRefreshToken,
  verifyPasswordResetToken
} from "../../../application/use-cases/auth.use-case.js";
import { authForbiddenError } from "../../../infrastructure/http/errors.js";
import {
  createAdminUserSchema,
  deleteAccountSchema,
  loginSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  refreshSchema,
  registerSchema
} from "../schemas/auth.schemas.js";

const roleNameByInput: Record<string, string> = {
  customer: "customer",
  admin: "admin",
  picker: "picker",
  driver: "driver",
  superadmin: "superadmin"
};

export const registerHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = registerSchema.parse(request.body);
  const role = await prisma.role.findFirst({ where: { name: "customer" } });
  if (!role) {
    reply.code(500).send({ error: { code: "AUTH_000", message: "Rol customer no configurado" } });
    return;
  }
  const passwordHash = await hashPassword(body.password);
  const emailNorm = body.email.toLowerCase();
  const user = await prisma.user.create({
    data: {
      email: emailNorm,
      passwordHash,
      fullName: body.fullName,
      storeId: body.storeId,
      roleId: role.id
    },
    include: { role: true, permissions: true }
  });
  reply.code(201).send({ data: { id: user.id, email: user.email } });
};

export const loginHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = loginSchema.parse(request.body);
  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
    include: { role: true, permissions: true }
  });
  if (!user || !user.isActive || !(await comparePassword(body.password, user.passwordHash))) {
    reply.code(401).send({ error: { code: "AUTH_001", message: "Credenciales invalidas" } });
    return;
  }

  const payload = {
    sub: user.id,
    role: user.role.name as "customer" | "admin" | "picker" | "driver" | "superadmin",
    store_id: user.storeId,
    permissions: user.permissions.map((p: UserPermission) => p.permission)
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await hashPassword(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
  reply.send({ data: { accessToken, refreshToken } });
};

export const refreshHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = refreshSchema.parse(request.body);
  const decoded = jwt.decode(body.refreshToken) as { sub?: string } | null;
  if (!decoded?.sub) {
    reply.code(401).send({ error: { code: "AUTH_001", message: "Refresh token invalido" } });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    include: { role: true, permissions: true }
  });
  if (!user || !user.isActive) {
    reply.code(401).send({ error: { code: "AUTH_001", message: "Usuario invalido" } });
    return;
  }

  const payload = {
    sub: user.id,
    role: user.role.name as "customer" | "admin" | "picker" | "driver" | "superadmin",
    store_id: user.storeId,
    permissions: user.permissions.map((p: UserPermission) => p.permission)
  };
  const accessToken = signAccessToken(payload);
  reply.send({ data: { accessToken } });
};

export const logoutHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = refreshSchema.parse(request.body);
  const tokens = await prisma.refreshToken.findMany();
  for (const token of tokens) {
    if (await comparePassword(body.refreshToken, token.tokenHash)) {
      await prisma.refreshToken.update({
        where: { id: token.id },
        data: { revokedAt: new Date() }
      });
      break;
    }
  }
  reply.send({ data: { success: true } });
};

export const meHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const userId = (request.user as { sub: string }).sub;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, permissions: true }
  });
  if (!user || !user.isActive) {
    reply.code(404).send({ error: { code: "AUTH_003", message: "Usuario no encontrado" } });
    return;
  }
  reply.send({
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      permissions: user.permissions.map((p: UserPermission) => p.permission)
    }
  });
};

/** Respuesta uniforme para no filtrar si el correo existe (en producción el token solo va por email). */
export const passwordResetRequestHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = passwordResetRequestSchema.parse(request.body);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  const base = { ok: true as const, message: "Si el correo esta registrado, recibiras un enlace para restablecer la contrasena." };

  if (!user || !user.isActive) {
    reply.send({ data: base });
    return;
  }

  const resetToken = signPasswordResetToken(user.id);
  const exposeToken = process.env.NODE_ENV !== "production";
  reply.send({
    data: exposeToken ? { ...base, resetToken } : base
  });
};

export const passwordResetConfirmHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = passwordResetConfirmSchema.parse(request.body);
  const decoded = verifyPasswordResetToken(body.token);
  if (!decoded) {
    reply.code(400).send({ error: { code: "AUTH_010", message: "Enlace invalido o vencido" } });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.isActive) {
    reply.code(400).send({ error: { code: "AUTH_010", message: "Enlace invalido o vencido" } });
    return;
  }
  const passwordHash = await hashPassword(body.newPassword);
  await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
  ]);
  reply.send({ data: { success: true } });
};

/** Solo cuentas con rol customer (compradores). */
export const deleteAccountHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const userId = (request.user as { sub: string }).sub;
  const body = deleteAccountSchema.parse(request.body);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true }
  });
  if (!user || !user.isActive) {
    reply.code(404).send({ error: { code: "AUTH_003", message: "Usuario no encontrado" } });
    return;
  }
  if (user.role.name !== "customer") {
    reply.code(403).send({
      error: { code: "AUTH_011", message: "Esta cuenta no se puede eliminar desde aqui. Contacta soporte." }
    });
    return;
  }
  if (!(await comparePassword(body.password, user.passwordHash))) {
    reply.code(401).send({ error: { code: "AUTH_012", message: "Contrasena incorrecta" } });
    return;
  }
  await prisma.user.delete({ where: { id: user.id } });
  reply.send({ data: { deleted: true } });
};

export const createAdminUserHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const actorRole = (request.user as { role: string }).role;
  if (actorRole !== "superadmin") {
    throw authForbiddenError();
  }
  const body = createAdminUserSchema.parse(request.body);
  const role = await prisma.role.findFirst({ where: { name: roleNameByInput[body.role] } });
  if (!role) {
    reply.code(400).send({ error: { code: "AUTH_004", message: "Rol invalido" } });
    return;
  }
  const passwordHash = await hashPassword(body.password);
  const created = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash,
      fullName: body.fullName,
      roleId: role.id,
      storeId: body.storeId,
      permissions: {
        createMany: {
          data: body.permissions.map((permission) => ({ permission }))
        }
      }
    }
  });
  reply.code(201).send({ data: { id: created.id } });
};
