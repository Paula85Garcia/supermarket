/** Imagen de referencia para catálogo y placeholders hasta definir fotos propias. */
export const MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE =
  "https://tse3.mm.bing.net/th/id/OIP.ebIyU2BfsfC9j1Rjc9wMkwHaE8?pid=Api&P=0&h=180";

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  categorySlug: string;
  name: string;
  price: string;
  image: string;
  stock: "Disponible" | "Pocas unidades" | "Agotado";
  description?: string;
  /** Precio tachado en UI cuando hay promo */
  promoOriginalCOP?: number;
}

export const categories: Category[] = [
  { id: "cat-1", slug: "lacteos", name: "Lacteos" },
  { id: "cat-2", slug: "granos", name: "Granos" },
  { id: "cat-3", slug: "despensa", name: "Despensa" },
  { id: "cat-4", slug: "aseo", name: "Aseo" },
  { id: "cat-5", slug: "bebidas", name: "Bebidas" }
];

export const products: Product[] = [
  { id: "p-1", categorySlug: "lacteos", name: "Leche Entera Alqueria 1L", price: "$5.200", image: MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE, stock: "Disponible" },
  { id: "p-2", categorySlug: "lacteos", name: "Yogurt Natural Alpina", price: "$8.600", image: MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE, stock: "Disponible" },
  { id: "p-3", categorySlug: "granos", name: "Arroz Diana 500g", price: "$3.400", image: MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE, stock: "Disponible" },
  { id: "p-4", categorySlug: "granos", name: "Frijol Cargamanto 500g", price: "$6.200", image: MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE, stock: "Pocas unidades" },
  { id: "p-5", categorySlug: "despensa", name: "Aceite Gourmet 900ml", price: "$12.300", image: MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE, stock: "Disponible" },
  { id: "p-6", categorySlug: "despensa", name: "Pasta Doria Tornillo 250g", price: "$2.700", image: MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE, stock: "Disponible" },
  { id: "p-7", categorySlug: "aseo", name: "Detergente Fab 1kg", price: "$9.900", image: MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE, stock: "Disponible" },
  { id: "p-8", categorySlug: "bebidas", name: "Gaseosa Coca-Cola 1.5L", price: "$7.300", image: MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE, stock: "Pocas unidades" }
];

export const getCategoryBySlug = (slug: string) => categories.find((category) => category.slug === slug);
