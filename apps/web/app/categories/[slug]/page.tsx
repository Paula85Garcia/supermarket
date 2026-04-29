import { notFound } from "next/navigation";
import { AppShell } from "../../../components/app-shell";
import { ProductGrid } from "../../../components/product-grid";
import { getCategoryBySlug } from "../../../lib/data";

interface CategoryDetailPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const category = getCategoryBySlug(params.slug);
  if (!category) {
    notFound();
  }

  return (
    <AppShell>
      <section className="mt-6">
        <h2 className="font-headline text-2xl font-semibold text-white">
          {category.emoji} {category.name}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">Productos disponibles en {category.name.toLowerCase()}.</p>
      </section>
      <ProductGrid title={`Catalogo de ${category.name}`} categorySlug={category.slug} />
    </AppShell>
  );
}
