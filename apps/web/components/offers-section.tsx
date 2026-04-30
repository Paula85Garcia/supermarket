"use client";

import { motion } from "framer-motion";
import { FreeShippingProgress } from "./free-shipping-progress";
import { PromoProductsCarousel } from "./promo-products-carousel";

export function OffersSection() {
  return (
    <section className="mt-6">
      <h3 className="font-headline text-lg font-semibold text-white">Ofertas y promociones</h3>
      <p className="mt-1 text-sm text-zinc-500">Desliza para ver productos con precio especial. Envío gratis al cumplir el monto.</p>

      <div className="mt-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FreeShippingProgress variant="card" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <PromoProductsCarousel />
        </motion.div>
      </div>
    </section>
  );
}
