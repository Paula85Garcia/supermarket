"use client";

import { motion } from "framer-motion";
import { AddToCartButton } from "./add-to-cart-button";
import type { Product } from "../lib/data";
import { products as allProducts } from "../lib/data";

interface ProductGridProps {
  title?: string;
  products?: Product[];
}

export function ProductGrid({ title = "Productos destacados", products = allProducts }: ProductGridProps) {
  return (
    <section className="mt-8 pb-24 md:pb-8">
      <h3 className="font-headline text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <motion.article
            key={product.id}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="rounded-2xl border border-merka-border bg-merka-surface p-4 hover:shadow-glow"
          >
            <div className="mb-4 h-40 rounded-xl border border-merka-border bg-gradient-to-br from-zinc-800 to-zinc-900" />
            <h4 className="font-headline text-base font-medium text-white">{product.name}</h4>
            <p className="mt-1 text-lg font-bold text-merka-yellow">{product.price}</p>
            <p className={`mt-1 text-xs ${product.stock === "Disponible" ? "text-merka-green" : "text-merka-red"}`}>
              {product.stock}
            </p>
            <AddToCartButton product={product} />
          </motion.article>
        ))}
      </div>
    </section>
  );
}
