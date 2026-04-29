import type { FastifyReply, FastifyRequest } from "fastify";

export const healthHandler = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  reply.send({ data: { ok: true } });
};
