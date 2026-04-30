import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { CategoryIcon } from "../../components/category-icon";
import { categories } from "../../lib/data";

export default function CategoriesPage() {
  return (
    <AppShell>
      <section className="mt-6">
        <h2 className="font-headline text-2xl font-semibold text-white">Categorias</h2>
        <p className="mt-1 text-sm text-zinc-400">Selecciona una categoria para ver productos filtrados.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-2xl border border-merka-border bg-merka-surface p-5 transition hover:border-merka-yellow hover:bg-merka-yellow/10"
            >
              <CategoryIcon slug={category.slug} className="h-8 w-8 text-merka-yellow" />
              <h3 className="mt-2 font-headline text-lg font-semibold text-white">{category.name}</h3>
              <p className="mt-1 text-sm opacity-80">Ver productos de {category.name.toLowerCase()}.</p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
