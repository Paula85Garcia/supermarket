import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../infrastructure/database/prisma.js";
import { publishFulfillmentEvent } from "../../../infrastructure/kafka/event.publisher.js";
import { acceptSchema, idParamsSchema, issueSchema, queueQuerySchema } from "../schemas/fulfillment.schemas.js";

export const getQueueHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { store_id } = queueQuerySchema.parse(request.query);
  const data = await prisma.fulfillmentTask.findMany({
    where: { storeId: store_id, status: { in: ["assigned", "accepted"] } },
    orderBy: { createdAt: "asc" }
  });
  reply.send({ data });
};

export const acceptTaskHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = idParamsSchema.parse(request.params);
  const body = acceptSchema.parse(request.body);
  const updated = await prisma.fulfillmentTask.update({
    where: { id },
    data: { pickerId: body.picker_id, status: "accepted" }
  });
  await publishFulfillmentEvent("fulfillment.task.accepted", { task_id: updated.id, order_id: updated.orderId });
  reply.send({ data: updated });
};

export const markReadyHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = idParamsSchema.parse(request.params);
  const updated = await prisma.fulfillmentTask.update({
    where: { id },
    data: { status: "ready" }
  });
  await publishFulfillmentEvent("fulfillment.task.ready", { task_id: updated.id, order_id: updated.orderId });
  reply.send({ data: updated });
};

export const getItemsHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = idParamsSchema.parse(request.params);
  const task = await prisma.fulfillmentTask.findUnique({ where: { id } });
  if (!task) {
    reply.code(404).send({ error: { code: "FUL_404", message: "Tarea no encontrada" } });
    return;
  }
  reply.send({ data: task.items ?? [] });
};

export const reportIssueHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = idParamsSchema.parse(request.params);
  const body = issueSchema.parse(request.body);
  const updated = await prisma.fulfillmentTask.update({
    where: { id },
    data: { status: "issue_reported", issue: body.reason }
  });
  await publishFulfillmentEvent("fulfillment.task.issue_reported", {
    task_id: updated.id,
    order_id: updated.orderId,
    reason: body.reason
  });
  reply.send({ data: updated });
};
