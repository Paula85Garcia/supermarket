"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductImageBlock } from "./product-image-block";
import type { Product } from "../lib/data";
import { getMergedCatalogProducts, subscribeCatalog } from "../lib/catalog-merge";

interface ProductGridProps {
  title?: string;
  /** Si se indica, solo productos de esa categoria */
  categorySlug?: string;
  /** Filtro por nombre / descripcion (desde buscador del header) */
  searchQuery?: string;
}

export function ProductGrid({ title = "Productos destacados", categorySlug, searchQuery = "" }: ProductGridProps) {
  const [list, setList] = useState<Product[]>([]);

  useEffect(() => {
    const refresh = () => {
      const all = getMergedCatalogProducts();
      setList(categorySlug ? all.filter((p) => p.categorySlug === categorySlug) : all);
    };
    refresh();
    return subscribeCatalog(refresh);
  }, [categorySlug]);

  const needle = searchQuery.trim().toLowerCase();
  const visible = needle
    ? list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.description ?? "").toLowerCase().includes(needle) ||
          p.categorySlug.toLowerCase().includes(needle)
      )
    : list;

  return (
    <section className="mt-8 pb-24 md:pb-8">
      <h3 className="font-headline text-lg font-semibold text-white">{title}</h3>
      {needle ? (
        <p className="mt-2 text-sm text-zinc-400">
          {visible.length} resultado{visible.length === 1 ? "" : "s"} para &quot;{searchQuery.trim()}&quot;
        </p>
      ) : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.length === 0 ? (
          <p className="col-span-full text-sm text-zinc-500">{needle ? "No hay productos que coincidan." : "Sin productos."}</p>
        ) : null}
        {visible.map((product) => (
          <motion.article
            key={product.id}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="rounded-2xl border border-merka-border bg-merka-surface p-4 shadow-none transition-shadow duration-300 hover:shadow-card"
          >
            <ProductImageBlock src={product.image} alt={product.name} />
            <h4 className="font-headline text-base font-medium text-white">{product.name}</h4>
            {product.description ? <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{product.description}</p> : null}
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <p className="text-lg font-bold text-merka-yellow">{product.price}</p>
              {product.promoOriginalCOP ? (
                <p className="text-sm text-zinc-500 line-through">${product.promoOriginalCOP.toLocaleString("es-CO")}</p>
              ) : null}
            </div>
            <p
              className={`mt-1 text-xs ${
                product.stock === "Disponible" ? "text-merka-green" : product.stock === "Agotado" ? "text-merka-red" : "text-merka-yellow"
              }`}
            >
              {product.stock}
            </p>
            <AddToCartButton product={product} />
          </motion.article>
        ))}
      </div>
    </section>
  );
}
