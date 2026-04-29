import mongoose from "mongoose";
import { env } from "../config/env.js";
import { ProductModel } from "../domain/entities/product.entity.js";

const products = [
  { id: "p-001", sku: "LACT-001", name: "Leche Alqueria Entera 1L", description: "Leche entera UHT", price: 5200, images: ["https://example.com/leche.jpg"], category_id: "lacteos", attributes: { marca: "Alqueria", contenido: "1L" }, is_active: true },
  { id: "p-002", sku: "LACT-002", name: "Queso Campesino Colanta 500g", description: "Queso fresco campesino", price: 12400, images: ["https://example.com/queso.jpg"], category_id: "lacteos", attributes: { marca: "Colanta", peso: "500g" }, is_active: true },
  { id: "p-003", sku: "CARN-001", name: "Pechuga de Pollo 1kg", description: "Pechuga sin piel", price: 18900, images: ["https://example.com/pollo.jpg"], category_id: "carnes", attributes: { corte: "pechuga", peso: "1kg" }, is_active: true },
  { id: "p-004", sku: "CARN-002", name: "Carne Molida Res 500g", description: "Carne molida premium", price: 15400, images: ["https://example.com/molida.jpg"], category_id: "carnes", attributes: { tipo: "res", peso: "500g" }, is_active: true },
  { id: "p-005", sku: "ASEO-001", name: "Jabon Rey Barra", description: "Jabon azul tradicional", price: 3200, images: ["https://example.com/jabon.jpg"], category_id: "aseo", attributes: { uso: "ropa", presentacion: "barra" }, is_active: true },
  { id: "p-006", sku: "ASEO-002", name: "Detergente Fab 1kg", description: "Detergente en polvo", price: 9900, images: ["https://example.com/fab.jpg"], category_id: "aseo", attributes: { marca: "Fab", peso: "1kg" }, is_active: true },
  { id: "p-007", sku: "FRUT-001", name: "Banano Bocadillo 1kg", description: "Banano fresco nacional", price: 4500, images: ["https://example.com/banano.jpg"], category_id: "frutas", attributes: { origen: "Colombia", peso: "1kg" }, is_active: true },
  { id: "p-008", sku: "FRUT-002", name: "Mango Tommy x3", description: "Mango maduro", price: 6800, images: ["https://example.com/mango.jpg"], category_id: "frutas", attributes: { unidad: "3 und" }, is_active: true },
  { id: "p-009", sku: "BEB-001", name: "Gaseosa Coca-Cola 1.5L", description: "Bebida carbonatada", price: 7300, images: ["https://example.com/coca.jpg"], category_id: "bebidas", attributes: { volumen: "1.5L" }, is_active: true },
  { id: "p-010", sku: "BEB-002", name: "Jugo Hit Mango 1L", description: "Jugo de fruta", price: 5200, images: ["https://example.com/hit.jpg"], category_id: "bebidas", attributes: { sabor: "mango", volumen: "1L" }, is_active: true },
  { id: "p-011", sku: "LACT-003", name: "Yogurt Alpina Fresa 1000g", description: "Yogurt cremoso", price: 8600, images: ["https://example.com/yogurt.jpg"], category_id: "lacteos", attributes: { sabor: "fresa", peso: "1000g" }, is_active: true },
  { id: "p-012", sku: "LACT-004", name: "Mantequilla Colanta 250g", description: "Mantequilla de vaca", price: 7800, images: ["https://example.com/mantequilla.jpg"], category_id: "lacteos", attributes: { peso: "250g" }, is_active: true },
  { id: "p-013", sku: "CARN-003", name: "Chuleta de Cerdo 1kg", description: "Chuleta fresca", price: 22900, images: ["https://example.com/chuleta.jpg"], category_id: "carnes", attributes: { corte: "chuleta", peso: "1kg" }, is_active: true },
  { id: "p-014", sku: "CARN-004", name: "Salchicha Zenú Tradicional 500g", description: "Salchicha tipo coctel", price: 9200, images: ["https://example.com/salchicha.jpg"], category_id: "carnes", attributes: { marca: "Zenu", peso: "500g" }, is_active: true },
  { id: "p-015", sku: "ASEO-003", name: "Suavizante Suavitel 2L", description: "Suavizante para ropa", price: 13400, images: ["https://example.com/suavitel.jpg"], category_id: "aseo", attributes: { volumen: "2L" }, is_active: true },
  { id: "p-016", sku: "ASEO-004", name: "Limpido Original 1L", description: "Desinfectante multiusos", price: 5400, images: ["https://example.com/limpido.jpg"], category_id: "aseo", attributes: { volumen: "1L" }, is_active: true },
  { id: "p-017", sku: "FRUT-003", name: "Manzana Roja 1kg", description: "Manzana importada", price: 9800, images: ["https://example.com/manzana.jpg"], category_id: "frutas", attributes: { tipo: "roja", peso: "1kg" }, is_active: true },
  { id: "p-018", sku: "FRUT-004", name: "Aguacate Hass x4", description: "Aguacate maduro", price: 12000, images: ["https://example.com/aguacate.jpg"], category_id: "frutas", attributes: { unidad: "4 und" }, is_active: true },
  { id: "p-019", sku: "BEB-003", name: "Agua Manantial 600ml", description: "Agua sin gas", price: 2100, images: ["https://example.com/agua.jpg"], category_id: "bebidas", attributes: { volumen: "600ml" }, is_active: true },
  { id: "p-020", sku: "BEB-004", name: "Cafe Sello Rojo 500g", description: "Cafe molido colombiano", price: 16400, images: ["https://example.com/cafe.jpg"], category_id: "bebidas", attributes: { peso: "500g" }, is_active: true }
];

const run = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI);
  await ProductModel.deleteMany({});
  await ProductModel.insertMany(products);
  await mongoose.disconnect();
};

run();
