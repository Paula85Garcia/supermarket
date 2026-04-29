import type { FastifyReply, FastifyRequest } from "fastify";
import { ProductModel } from "../../../domain/entities/product.entity.js";
import {
  listProductsQuerySchema,
  productIdParamsSchema,
  searchQuerySchema,
  upsertProductSchema
} from "../schemas/catalog.schemas.js";

export const listProductsHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const query = listProductsQuerySchema.parse(request.query);
  const filter: Record<string, unknown> = {};
  if (query.category_id) filter.category_id = query.category_id;
  if (typeof query.is_active === "boolean") filter.is_active = query.is_active;

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    ProductModel.find(filter).skip(skip).limit(query.limit).lean(),
    ProductModel.countDocuments(filter)
  ]);

  reply.send({
    data: items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      total_pages: Math.ceil(total / query.limit)
    }
  });
};

export const getProductByIdHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = productIdParamsSchema.parse(request.params);
  const product = await ProductModel.findOne({ id }).lean();
  if (!product) {
    reply.code(404).send({ error: { code: "CAT_001", message: "Producto no encontrado" } });
    return;
  }
  reply.send({ data: product });
};

export const searchProductsHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { q } = searchQuerySchema.parse(request.query);
  const products = await ProductModel.find({
    $or: [{ name: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }]
  })
    .limit(20)
    .lean();
  reply.send({ data: products });
};

export const listCategoriesHandler = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const categories = await ProductModel.distinct("category_id");
  reply.send({ data: categories });
};

export const createProductHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const body = upsertProductSchema.parse(request.body);
  const created = await ProductModel.create(body);
  reply.code(201).send({ data: created.toObject() });
};

export const updateProductHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const { id } = productIdParamsSchema.parse(request.params);
  const body = upsertProductSchema.partial().parse(request.body);
  const updated = await ProductModel.findOneAndUpdate({ id }, body, { new: true }).lean();
  if (!updated) {
    reply.code(404).send({ error: { code: "CAT_001", message: "Producto no encontrado" } });
    return;
  }
  reply.send({ data: updated });
};
