"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck } from "lucide-react";
import { useCart } from "../lib/cart-context";

const FREE_COP = 20_000;

type Variant = "compact" | "card";

export function FreeShippingProgress({ variant = "card" }: { variant?: Variant }) {
  const { subtotal } = useCart();
  const [burst, setBurst] = useState(false);
  const wasFree = useRef(false);

  const { pct, remaining, isFree } = useMemo(() => {
    const raw = Math.min(100, (subtotal / FREE_COP) * 100);
    const rem = Math.max(0, FREE_COP - subtotal);
    return { pct: raw, remaining: rem, isFree: subtotal >= FREE_COP };
  }, [subtotal]);

  useEffect(() => {
    if (isFree && !wasFree.current && subtotal > 0) {
      wasFree.current = true;
      setBurst(true);
      const t = window.setTimeout(() => setBurst(false), 2200);
      return () => window.clearTimeout(t);
    }
    if (!isFree) wasFree.current = false;
  }, [isFree, subtotal]);

  const barColor = isFree ? "bg-merka-green" : "bg-merka-yellow";

  const inner = (
    <>
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Truck className={`h-4 w-4 shrink-0 ${isFree ? "text-merka-green" : "text-merka-yellow"}`} />
          <p className={`text-sm font-medium ${isFree ? "text-merka-green" : "text-zinc-200"}`}>
            {isFree ? "Felicidades! Tienes envio GRATIS" : `Te faltan $${remaining.toLocaleString("es-CO")} para envio GRATIS`}
          </p>
        </div>
        {!isFree ? <span className="text-xs text-zinc-500">Meta $20.000</span> : null}
      </div>
      <div className="relative z-10 mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
      <AnimatePresence>
        {burst ? (
          <motion.div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-merka-yellow"
                style={{ left: `${(i * 7) % 100}%`, top: "50%" }}
                initial={{ y: 0, opacity: 1, scale: 0 }}
                animate={{
                  y: [-10, -40 - (i % 5) * 8],
                  x: [(i % 3) * 12 - 12, (i % 5) * 10 - 20],
                  opacity: [1, 0],
                  scale: [0, 1.2, 0]
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            ))}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );

  if (variant === "compact") {
    return (
      <div className="relative mt-3 w-full overflow-hidden rounded-xl border border-merka-border bg-black/50 px-3 py-2 md:max-w-2xl">
        {inner}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-merka-border bg-gradient-to-br from-zinc-900/90 to-black p-4">
      {inner}
    </div>
  );
}
