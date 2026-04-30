"use client";

import { Check, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "../lib/data";
import { useCart } from "../lib/cart-context";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { items, addItem } = useCart();
  const added = items.some((item) => item.id === product.id);
  const disabled = product.stock === "Agotado";

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      onClick={() => addItem(product)}
      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
        disabled ? "cursor-not-allowed bg-zinc-700 text-zinc-400" : added ? "bg-merka-green text-white" : "bg-merka-yellow text-black"
      }`}
    >
      {added ? <Check size={16} /> : <ShoppingCart size={16} />}
      {disabled ? "Agotado" : added ? "Agregar otro" : "Agregar"}
    </motion.button>
  );
}
