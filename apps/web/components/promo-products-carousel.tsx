"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "../lib/data";
import { MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE } from "../lib/data";
import { getPromotionalProducts, subscribeCatalog } from "../lib/catalog-merge";
import { ProductImageBlock } from "./product-image-block";
import { AddToCartButton } from "./add-to-cart-button";

const SHOWCASE_ID = "__carousel_preview__";

/** Tarjeta fija al inicio para ver foto y estilo promo (no se agrega al carrito). */
const showcaseSlide: Product = {
  id: SHOWCASE_ID,
  categorySlug: "lacteos",
  name: "Leche en oferta (ejemplo visual)",
  price: "$4.590",
  image: MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE,
  stock: "Disponible",
  description: "Así se ve una promo en el carrusel.",
  promoOriginalCOP: 5200
};

export function PromoProductsCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const refresh = () => setItems(getPromotionalProducts());
    refresh();
    return subscribeCatalog(refresh);
  }, []);

  const slides = useMemo(() => [showcaseSlide, ...items], [items]);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-promo-slide]");
    const w = card?.offsetWidth ?? 280;
    el.scrollBy({ left: dir * (w + 16), behavior: "smooth" });
  }, []);

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
        {slides.map((product) => {
          const isShowcase = product.id === SHOWCASE_ID;
          return (
            <motion.article
              key={product.id}
              data-promo-slide
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              whileHover={{ scale: 1.02 }}
              className={`w-[min(100%,280px)] shrink-0 snap-start rounded-2xl border bg-merka-surface p-4 shadow-[0_0_0_1px_rgba(255,215,0,0.08)] ${
                isShowcase ? "border-merka-green/40" : "border-merka-yellow/25"
              }`}
            >
              <div
                className={`mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  isShowcase ? "border border-merka-green/40 bg-merka-green/15 text-merka-green" : "bg-merka-red/20 text-merka-red"
                }`}
              >
                <Tag className="h-3 w-3" aria-hidden />
                {isShowcase ? "Ejemplo" : "Promo"}
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
              {isShowcase ? (
                <p className="mt-4 rounded-lg border border-merka-border bg-black/40 px-2 py-2 text-center text-[10px] text-zinc-500">
                  Solo demostración visual
                </p>
              ) : (
                <AddToCartButton product={product} />
              )}
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
