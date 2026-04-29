import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../infrastructure/database/prisma.js";
import { redis } from "../../../infrastructure/redis/redis.client.js";
import { publishDeliveryEvent } from "../../../infrastructure/kafka/event.publisher.js";
import { assignSchema, locationSchema, orderIdParamsSchema } from "../schemas/delivery.schemas.js";

const calculateEtaMinutes = (transitMinutes: number, preparationMinutes: number, waitMinutes: number, bufferPercent: number): number => {
  const subtotal = transitMinutes + preparationMinutes + waitMinutes;
  const buffer = Math.ceil(subtotal * (bufferPercent / 100));
  return subtotal + buffer;
};

export const websocketTrackInfoHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { order_id } = orderIdParamsSchema.parse(request.params);
  const delivery = await prisma.delivery.findUnique({ where: { orderId: order_id } });
  if (!delivery) {
    reply.code(404).send({ error: { code: "DEL_404", message: "Entrega no encontrada" } });
    return;
  }
  const key = `driver:${delivery.driverId}:location`;
  const location = await redis.geopos("drivers_geo", key);
  reply.send({ data: { order_id, driver_id: delivery.driverId, location } });
};

export const assignDeliveryHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = assignSchema.parse(request.body);
  const delivery = await prisma.delivery.upsert({
    where: { orderId: body.order_id },
    update: { driverId: body.driver_id, status: "assigned" },
    create: { orderId: body.order_id, driverId: body.driver_id, status: "assigned" }
  });
  await publishDeliveryEvent("delivery.order.assigned", { order_id: delivery.orderId, driver_id: delivery.driverId });
  reply.send({ data: delivery });
};

export const updateLocationHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = locationSchema.parse(request.body);
  const key = `driver:${body.driver_id}:location`;
  await redis.geoadd("drivers_geo", body.lng, body.lat, key);
  await prisma.delivery.update({
    where: { orderId: body.order_id },
    data: { status: "in_transit" }
  });
  await publishDeliveryEvent("delivery.location.updated", {
    order_id: body.order_id,
    driver_id: body.driver_id,
    lat: body.lat,
    lng: body.lng
  });
  reply.send({ data: { updated: true } });
};

export const getEtaHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { order_id } = orderIdParamsSchema.parse(request.params);
  const delivery = await prisma.delivery.findUnique({ where: { orderId: order_id } });
  if (!delivery) {
    reply.code(404).send({ error: { code: "DEL_404", message: "Entrega no encontrada" } });
    return;
  }
  const eta = calculateEtaMinutes(18, 10, 4, 15);
  await prisma.delivery.update({ where: { orderId: order_id }, data: { etaMinutes: eta } });
  reply.send({ data: { order_id, eta_minutes: eta } });
};

export const confirmDeliveryHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { order_id } = orderIdParamsSchema.parse(request.params);
  const updated = await prisma.delivery.update({
    where: { orderId: order_id },
    data: { status: "delivered" }
  });
  await publishDeliveryEvent("delivery.order.delivered", { order_id: updated.orderId, driver_id: updated.driverId });
  reply.send({ data: updated });
};
