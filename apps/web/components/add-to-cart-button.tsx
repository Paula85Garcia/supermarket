"use client";

import { Check, ShoppingCart } from "lucide-react";
import type { Product } from "../lib/data";
import { useCart } from "../lib/cart-context";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { items, addItem } = useCart();
  const added = items.some((item) => item.id === product.id);

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
        added ? "bg-merka-green text-white" : "bg-merka-yellow text-merka-black"
      }`}
    >
      {added ? <Check size={16} /> : <ShoppingCart size={16} />}
      {added ? "Agregar otro" : "Agregar"}
    </button>
  );
}
