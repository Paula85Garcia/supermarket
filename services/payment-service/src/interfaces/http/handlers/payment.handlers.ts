import type { FastifyReply, FastifyRequest } from "fastify";
import CryptoJS from "crypto-js";
import { env } from "../../../config/env.js";
import { PrismaPaymentRepository } from "../../../infrastructure/database/payment-prisma.repository.js";
import { ConfirmPaymentUseCase } from "../../../application/use-cases/confirm-payment.use-case.js";
import { FailPaymentUseCase } from "../../../application/use-cases/fail-payment.use-case.js";
import { InitiatePaymentUseCase } from "../../../application/use-cases/initiate-payment.use-case.js";
import { RefundPaymentUseCase } from "../../../application/use-cases/refund-payment.use-case.js";
import {
  initiatePaymentSchema,
  nequiWebhookSchema,
  paymentIdParamsSchema,
  refundSchema,
  wompiWebhookSchema
} from "../schemas/payment.schemas.js";

const repository = new PrismaPaymentRepository();
const initiateUseCase = new InitiatePaymentUseCase(repository);
const confirmUseCase = new ConfirmPaymentUseCase(repository);
const failUseCase = new FailPaymentUseCase(repository);
const refundUseCase = new RefundPaymentUseCase(repository);

export const initiatePaymentHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = initiatePaymentSchema.parse(request.body);
  const payment = await initiateUseCase.execute({
    orderId: body.order_id,
    customerId: body.customer_id,
    method: body.method,
    amount: body.amount,
    gatewayToken: body.gateway_token
  });
  request.log.info({ paymentId: payment.id }, "Payment initiated");
  reply.code(201).send({ data: payment });
};

export const wompiWebhookHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = wompiWebhookSchema.parse(request.body);
  const tx = body.data.transaction;
  const integrityString = `${tx.id}${tx.status}${tx.reference}${body.timestamp}${env.WOMPI_WEBHOOK_SECRET}`;
  const checksum = CryptoJS.SHA256(integrityString).toString(CryptoJS.enc.Hex);
  if (checksum !== body.signature.checksum) {
    reply.code(401).send({ error: { code: "PAY_002", message: "Webhook con firma invalida" } });
    return;
  }

  const payment = await repository.findByOrderId(tx.reference);
  if (!payment) {
    reply.code(404).send({ error: { code: "PAY_404", message: "Pago no encontrado" } });
    return;
  }

  if (tx.status === "APPROVED") {
    await confirmUseCase.execute(payment.id, tx.id);
  } else {
    await failUseCase.execute(payment.id, `Wompi status ${tx.status}`);
  }
  reply.send({ data: { acknowledged: true } });
};

export const nequiWebhookHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = nequiWebhookSchema.parse(request.body);
  const payment = await repository.findByOrderId(body.order_id);
  if (!payment) {
    reply.code(404).send({ error: { code: "PAY_404", message: "Pago no encontrado" } });
    return;
  }
  if (body.status === "APPROVED") {
    await confirmUseCase.execute(payment.id, body.transaction_id);
  } else {
    await failUseCase.execute(payment.id, `Nequi status ${body.status}`);
  }
  reply.send({ data: { acknowledged: true } });
};

export const getPaymentByIdHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = paymentIdParamsSchema.parse(request.params);
  const payment = await repository.findById(id);
  if (!payment) {
    reply.code(404).send({ error: { code: "PAY_404", message: "Pago no encontrado" } });
    return;
  }
  reply.send({ data: payment });
};

export const refundPaymentHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = paymentIdParamsSchema.parse(request.params);
  const body = refundSchema.parse(request.body);
  const result = await refundUseCase.execute(id, body.amount, body.reason);
  if (!result) {
    reply.code(404).send({ error: { code: "PAY_404", message: "Pago no encontrado" } });
    return;
  }
  reply.send({ data: result });
};
