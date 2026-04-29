import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], required: true },
    category_id: { type: String, required: true, index: true },
    attributes: { type: Map, of: String, required: true, default: {} },
    is_active: { type: Boolean, required: true, default: true }
  },
  {
    collection: "products",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

export const ProductModel = model("Product", productSchema);
