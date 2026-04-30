"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "../lib/data";
import { getPromotionalProducts, subscribeCatalog } from "../lib/catalog-merge";
import { ProductImageBlock } from "./product-image-block";
import { AddToCartButton } from "./add-to-cart-button";

export function PromoProductsCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const refresh = () => setItems(getPromotionalProducts());
    refresh();
    return subscribeCatalog(refresh);
  }, []);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-promo-slide]");
    const w = card?.offsetWidth ?? 280;
    el.scrollBy({ left: dir * (w + 16), behavior: "smooth" });
  }, []);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-merka-border bg-merka-surface/60 px-4 py-10 text-center">
        <Tag className="mx-auto h-8 w-8 text-zinc-500" strokeWidth={1.5} aria-hidden />
        <p className="mt-3 text-sm text-zinc-400">No hay productos en promoción en este momento.</p>
        <p className="mt-1 text-xs text-zinc-500">Las ofertas activas aparecerán aquí automáticamente.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollByDir(-1)}
        className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 rounded-full border border-merka-border bg-merka-black/90 p-2 text-merka-yellow shadow-lg transition hover:bg-merka-yellow hover:text-black md:p-2.5"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByDir(1)}
        className="absolute right-0 top-1/2 z-10 flex -translate-y-1/2 rounded-full border border-merka-border bg-merka-black/90 p-2 text-merka-yellow shadow-lg transition hover:bg-merka-yellow hover:text-black md:p-2.5"
        aria-label="Siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={scrollerRef}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-11 pb-2 pt-1 [scrollbar-width:none] md:mx-0 md:px-12 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((product) => (
          <motion.article
            key={product.id}
            data-promo-slide
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            whileHover={{ scale: 1.02 }}
            className="w-[min(100%,280px)] shrink-0 snap-start rounded-2xl border border-merka-yellow/25 bg-merka-surface p-4 shadow-[0_0_0_1px_rgba(255,215,0,0.08)]"
          >
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-merka-red/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-merka-red">
              <Tag className="h-3 w-3" aria-hidden />
              Promo
            </div>
            <ProductImageBlock src={product.image} alt={product.name} className="!mb-3 !h-36" />
            <h4 className="font-headline text-sm font-semibold leading-snug text-white line-clamp-2">{product.name}</h4>
            {product.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{product.description}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <p className="text-base font-bold text-merka-yellow">{product.price}</p>
              {product.promoOriginalCOP ? (
                <p className="text-xs text-zinc-500 line-through">${product.promoOriginalCOP.toLocaleString("es-CO")}</p>
              ) : null}
            </div>
            <p
              className={`mt-1 text-[11px] ${
                product.stock === "Disponible"
                  ? "text-merka-green"
                  : product.stock === "Agotado"
                    ? "text-merka-red"
                    : "text-merka-yellow"
              }`}
            >
              {product.stock}
            </p>
            <AddToCartButton product={product} />
          </motion.article>
        ))}
      </div>
    </div>
  );
}
