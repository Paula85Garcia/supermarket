export interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string;
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
  { id: "cat-1", slug: "lacteos", name: "Lacteos", emoji: "🥛" },
  { id: "cat-2", slug: "granos", name: "Granos", emoji: "🌾" },
  { id: "cat-3", slug: "despensa", name: "Despensa", emoji: "🛒" },
  { id: "cat-4", slug: "aseo", name: "Aseo", emoji: "🧼" },
  { id: "cat-5", slug: "bebidas", name: "Bebidas", emoji: "🥤" }
];

export const products: Product[] = [
  { id: "p-1", categorySlug: "lacteos", name: "Leche Entera Alqueria 1L", price: "$5.200", image: "https://res.cloudinary.com/dky2dscgr/image/upload/v1711111111/merkamax/leche.jpg", stock: "Disponible" },
  { id: "p-2", categorySlug: "lacteos", name: "Yogurt Natural Alpina", price: "$8.600", image: "https://res.cloudinary.com/dky2dscgr/image/upload/v1711111111/merkamax/yogurt.jpg", stock: "Disponible" },
  { id: "p-3", categorySlug: "granos", name: "Arroz Diana 500g", price: "$3.400", image: "https://res.cloudinary.com/dky2dscgr/image/upload/v1711111111/merkamax/arroz.jpg", stock: "Disponible" },
  { id: "p-4", categorySlug: "granos", name: "Frijol Cargamanto 500g", price: "$6.200", image: "https://res.cloudinary.com/dky2dscgr/image/upload/v1711111111/merkamax/frijol.jpg", stock: "Pocas unidades" },
  { id: "p-5", categorySlug: "despensa", name: "Aceite Gourmet 900ml", price: "$12.300", image: "https://res.cloudinary.com/dky2dscgr/image/upload/v1711111111/merkamax/aceite.jpg", stock: "Disponible" },
  { id: "p-6", categorySlug: "despensa", name: "Pasta Doria Tornillo 250g", price: "$2.700", image: "https://res.cloudinary.com/dky2dscgr/image/upload/v1711111111/merkamax/pasta.jpg", stock: "Disponible" },
  { id: "p-7", categorySlug: "aseo", name: "Detergente Fab 1kg", price: "$9.900", image: "https://res.cloudinary.com/dky2dscgr/image/upload/v1711111111/merkamax/detergente.jpg", stock: "Disponible" },
  { id: "p-8", categorySlug: "bebidas", name: "Gaseosa Coca-Cola 1.5L", price: "$7.300", image: "https://res.cloudinary.com/dky2dscgr/image/upload/v1711111111/merkamax/gaseosa.jpg", stock: "Pocas unidades" }
];

export const getCategoryBySlug = (slug: string) => categories.find((category) => category.slug === slug);
