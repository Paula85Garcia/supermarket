"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { categories } from "../lib/data";

export function CategoriesRow() {
  return (
    <section className="mt-8">
      <h3 className="font-headline text-lg font-semibold text-white">Categorias</h3>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className="min-w-fit"
          >
            <Link
              href={`/categories/${category.slug}`}
              className="inline-flex min-w-fit items-center gap-2 rounded-full border border-merka-border bg-merka-surface px-4 py-2 text-sm text-zinc-200 transition hover:bg-merka-yellow hover:text-merka-black"
            >
              <span>{category.emoji}</span>
              {category.name}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
