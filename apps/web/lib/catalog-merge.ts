"use client";

import { categories, products, type Product, MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE } from "./data";

const STORAGE_KEY = "mkx_managed_products";
const CHANNEL = "mkx_catalog";

function broadcastCatalog(): void {
  if (typeof BroadcastChannel === "undefined") return;
  const ch = new BroadcastChannel(CHANNEL);
  ch.postMessage("sync");
  ch.close();
}

export function saveManagedProducts(items: ManagedProductRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  broadcastCatalog();
}

export function subscribeCatalog(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  let ch: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = () => onChange();
  }
  return () => {
    window.removeEventListener("storage", onStorage);
    ch?.close();
  };
}

export type ManagedProductStatus = "active" | "out_of_stock" | "inactive";

export interface ManagedProductRecord {
  id: string;
  name: string;
  description: string;
  categorySlug: string;
  priceCOP: number;
  imageUrl: string;
  status: ManagedProductStatus;
  onSale: boolean;
  promoPriceCOP: number | null;
  stockQty: number | null;
}

const defaultImage = MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE;

export function seedManagedProductsIfEmpty(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(STORAGE_KEY)) return;
  const seeded = products.map((product) => {
    const priceCOP = Number(product.price.replace(/[^\d]/g, "")) || 0;
    const demoPromo = product.id === "p-1" || product.id === "p-8";
    const promoPriceCOP = demoPromo ? Math.round(priceCOP * 0.88) : null;
    return {
      id: product.id,
      name: product.name,
      description: `Producto ${product.name}`,
      categorySlug: product.categorySlug,
      priceCOP,
      imageUrl: product.image,
      status: (product.stock === "Pocas unidades" ? "out_of_stock" : "active") as ManagedProductStatus,
      onSale: demoPromo,
      promoPriceCOP: demoPromo ? promoPriceCOP : (null as number | null),
      stockQty: null as number | null
    };
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  broadcastCatalog();
}

export function loadManagedProducts(): ManagedProductRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.id),
        name: String(r.name),
        description: String(r.description ?? ""),
        categorySlug: String(r.categorySlug ?? "despensa"),
        priceCOP: Number(r.priceCOP) || 0,
        imageUrl: typeof r.imageUrl === "string" && r.imageUrl ? r.imageUrl : defaultImage,
        status: (r.status as ManagedProductStatus) || "active",
        onSale: Boolean(r.onSale),
        promoPriceCOP: r.promoPriceCOP != null && r.promoPriceCOP !== "" ? Number(r.promoPriceCOP) : null,
        stockQty: r.stockQty === undefined || r.stockQty === "" ? null : Number(r.stockQty)
      };
    });
  } catch {
    return [];
  }
}

function managedToProduct(m: ManagedProductRecord): Product | null {
  if (m.status === "inactive") return null;
  const salePrice = m.onSale && m.promoPriceCOP != null && m.promoPriceCOP > 0 ? m.promoPriceCOP : m.priceCOP;
  let stock: Product["stock"] = "Disponible";
  if (m.status === "out_of_stock") stock = "Agotado";
  else if (m.stockQty === 0) stock = "Agotado";
  else if (m.stockQty != null && m.stockQty <= 3) stock = "Pocas unidades";
  const priceLabel = `$${salePrice.toLocaleString("es-CO")}`;
  return {
    id: m.id,
    categorySlug: m.categorySlug,
    name: m.name,
    price: priceLabel,
    image: m.imageUrl,
    stock,
    description: m.description,
    promoOriginalCOP: m.onSale && m.promoPriceCOP ? m.priceCOP : undefined
  };
}

export function getMergedCatalogProducts(): Product[] {
  seedManagedProductsIfEmpty();
  const managed = loadManagedProducts();
  const fromManaged = managed.map(managedToProduct).filter((p): p is Product => p != null);
  const managedIds = new Set(managed.map((m) => m.id));
  const rest = products.filter((p) => !managedIds.has(p.id));
  const withDesc = rest.map((p) => ({ ...p, description: `Producto ${p.name}` }));
  if (!fromManaged.length) return withDesc;
  return [...fromManaged, ...withDesc.filter((p) => !managedIds.has(p.id))];
}

/** Productos con precio promocional (admin o catálogo base con `promoOriginalCOP`). */
export function getPromotionalProducts(): Product[] {
  return getMergedCatalogProducts().filter(
    (p) => typeof p.promoOriginalCOP === "number" && p.promoOriginalCOP > 0
  );
}

export { categories };
