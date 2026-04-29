"use client";

import { motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";

export function HeroBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 flex flex-col justify-between gap-4 rounded-3xl border border-red-900/60 bg-gradient-to-r from-merka-red to-[#990000] p-6 md:flex-row md:items-center"
    >
      <div>
        <h2 className="font-headline text-2xl font-semibold text-white md:text-3xl">Hola, Merkamaxer!</h2>
        <p className="mt-2 max-w-xl text-sm text-red-50 md:text-base">
          Domicilio GRATIS en compras mayores a $20.000.
        </p>
        <p className="mt-1 max-w-xl text-xs text-red-100 md:text-sm">
          Si tu pedido es menor a $20.000, se aplica recargo de $2.000.
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-red-200/20 bg-black/20 px-4 py-3">
        <div className="rounded-full bg-merka-yellow p-2 text-merka-black">
          <ThumbsUp size={22} />
        </div>
        <div>
          <p className="font-headline text-sm font-semibold text-white">Max</p>
          <p className="text-xs text-red-100">Tu asistente inteligente</p>
        </div>
      </div>
    </motion.section>
  );
}
