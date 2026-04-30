"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "./product-grid";

function CategoryCatalogInner({ categorySlug, title }: { categorySlug: string; title: string }) {
  const searchParams = useSearchParams();
  const sig = searchParams.toString();
  const q = useMemo(() => searchParams.get("q") ?? "", [sig, searchParams]);
  return <ProductGrid key={`cat-grid-${sig}`} title={title} categorySlug={categorySlug} searchQuery={q} />;
}

export function CategoryCatalogSection({ categorySlug, title }: { categorySlug: string; title: string }) {
  return (
    <Suspense fallback={<ProductGrid title={title} categorySlug={categorySlug} searchQuery="" />}>
      <CategoryCatalogInner categorySlug={categorySlug} title={title} />
    </Suspense>
  );
}
