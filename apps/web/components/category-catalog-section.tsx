"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "./product-grid";

function CategoryCatalogInner({ categorySlug, title }: { categorySlug: string; title: string }) {
  const q = useSearchParams().get("q") ?? "";
  return <ProductGrid title={title} categorySlug={categorySlug} searchQuery={q} />;
}

export function CategoryCatalogSection({ categorySlug, title }: { categorySlug: string; title: string }) {
  return (
    <Suspense fallback={<ProductGrid title={title} categorySlug={categorySlug} searchQuery="" />}>
      <CategoryCatalogInner categorySlug={categorySlug} title={title} />
    </Suspense>
  );
}
