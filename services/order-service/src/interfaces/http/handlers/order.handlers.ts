import type { FastifyReply, FastifyRequest } from "fastify";
import { PrismaOrderRepository } from "../../../infrastructure/database/order-prisma.repository.js";
import { OrderSagaCoordinator } from "../../../application/sagas/order.saga.js";
import { CreateOrderUseCase } from "../../../application/use-cases/create-order.use-case.js";
import { CancelOrderUseCase } from "../../../application/use-cases/cancel-order.use-case.js";
import {
  createOrderSchema,
  customerParamsSchema,
  orderIdParamsSchema,
  updateOrderStatusSchema
} from "../schemas/order.schemas.js";

const repository = new PrismaOrderRepository();
const saga = new OrderSagaCoordinator(repository);
const createOrder = new CreateOrderUseCase(repository, saga);
const cancelOrder = new CancelOrderUseCase(repository);

export const createOrderHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = createOrderSchema.parse(request.body);
  const totalAmount = body.items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  const order = await createOrder.execute({
    customerId: body.customer_id,
    storeId: body.store_id,
    items: body.items,
    totalAmount
  });
  request.log.info({ orderId: order.id }, "Order created and saga started");
  reply.code(201).send({ data: order });
};

export const getOrderByIdHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = orderIdParamsSchema.parse(request.params);
  const order = await repository.findById(id);
  if (!order) {
    reply.code(404).send({ error: { code: "ORDER_404", message: "Pedido no encontrado" } });
    return;
  }
  reply.send({ data: order });
};

export const getOrdersByCustomerHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = customerParamsSchema.parse(request.params);
  const orders = await repository.findByCustomer(id);
  reply.send({ data: orders });
};

export const cancelOrderHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = orderIdParamsSchema.parse(request.params);
  try {
    const result = await cancelOrder.execute(id);
    if (!result) {
      reply.code(404).send({ error: { code: "ORDER_404", message: "Pedido no encontrado" } });
      return;
    }
    reply.send({ data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_002") {
      reply.code(409).send({ error: { code: "ORDER_002", message: "Pedido no cancelable en estado actual" } });
      return;
    }
    throw error;
  }
};

export const storeQueueHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const storeId = (request.query as { store_id?: string }).store_id;
  if (!storeId) {
    reply.code(400).send({ error: { code: "ORDER_400", message: "store_id es requerido" } });
    return;
  }
  const queue = await repository.findStoreQueue(storeId);
  reply.send({ data: queue });
};

export const updateOrderStatusHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = orderIdParamsSchema.parse(request.params);
  const body = updateOrderStatusSchema.parse(request.body);
  const updated = await repository.updateStatus(id, body.status);
  if (!updated) {
    reply.code(404).send({ error: { code: "ORDER_404", message: "Pedido no encontrado" } });
    return;
  }
  reply.send({ data: updated });
};
