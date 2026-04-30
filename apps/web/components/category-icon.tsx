"use client";

import type { LucideIcon } from "lucide-react";
import { CupSoda, Milk, ShoppingBasket, Sparkles, Wheat } from "lucide-react";

const bySlug: Record<string, LucideIcon> = {
  lacteos: Milk,
  granos: Wheat,
  despensa: ShoppingBasket,
  aseo: Sparkles,
  bebidas: CupSoda
};

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = bySlug[slug] ?? ShoppingBasket;
  return <Icon className={className ?? "h-5 w-5 text-merka-yellow"} strokeWidth={1.75} aria-hidden />;
}
