"use client";

import { useMemo, useState } from "react";
import { categories, products } from "../lib/data";

type ProductStatus = "active" | "out_of_stock" | "inactive";

interface ManagedProduct {
  id: string;
  name: string;
  description: string;
  categorySlug: string;
  priceCOP: number;
  status: ProductStatus;
}

const STORAGE_KEY = "mkx_managed_products";

const seedProducts = (): ManagedProduct[] =>
  products.map((product) => ({
    id: product.id,
    name: product.name,
    description: `Producto ${product.name}`,
    categorySlug: product.categorySlug,
    priceCOP: Number(product.price.replace(/[^\d]/g, "")) || 0,
    status: product.stock === "Pocas unidades" ? "out_of_stock" : "active"
  }));

const loadProducts = (): ManagedProduct[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedProducts();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as ManagedProduct[];
  } catch {
    return seedProducts();
  }
};

const saveProducts = (items: ManagedProduct[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export function ProductAdminManager() {
  const [items, setItems] = useState<ManagedProduct[]>(() => loadProducts());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categorySlug: categories[0]?.slug ?? "despensa",
    priceCOP: "0"
  });

  const activeItems = useMemo(() => items.filter((item) => item.status !== "inactive"), [items]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", description: "", categorySlug: categories[0]?.slug ?? "despensa", priceCOP: "0" });
  };

  const persist = (next: ManagedProduct[]) => {
    setItems(next);
    saveProducts(next);
  };

  const submit = () => {
    if (!form.name.trim() || !form.description.trim()) return;
    const price = Number(form.priceCOP);
    if (!Number.isFinite(price) || price <= 0) return;

    if (editingId) {
      persist(
        items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: form.name.trim(),
                description: form.description.trim(),
                categorySlug: form.categorySlug,
                priceCOP: price
              }
            : item
        )
      );
      resetForm();
      return;
    }

    const created: ManagedProduct = {
      id: `p-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      categorySlug: form.categorySlug,
      priceCOP: price,
      status: "active"
    };
    persist([created, ...items]);
    resetForm();
  };

  const startEdit = (item: ManagedProduct) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      categorySlug: item.categorySlug,
      priceCOP: String(item.priceCOP)
    });
  };

  const setStatus = (id: string, status: ProductStatus) => {
    persist(items.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const remove = (id: string) => {
    persist(items.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <section className="mt-5 rounded-2xl border border-merka-border bg-merka-surface p-5">
      <h3 className="font-headline text-lg font-semibold text-white">Crear y gestionar productos</h3>
      <p className="mt-1 text-xs text-zinc-400">Admin puede crear, editar, marcar agotado, desactivar o eliminar productos.</p>

      <div className="mt-4 grid gap-2 md:grid-cols-4">
        <input
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
          placeholder="Nombre producto"
        />
        <input
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
          placeholder="Descripcion"
        />
        <select
          value={form.categorySlug}
          onChange={(e) => setForm((prev) => ({ ...prev, categorySlug: e.target.value }))}
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          value={form.priceCOP}
          onChange={(e) => setForm((prev) => ({ ...prev, priceCOP: e.target.value }))}
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
          placeholder="Precio (COP)"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={submit} className="rounded-xl bg-merka-yellow px-3 py-2 text-xs font-semibold text-merka-black">
          {editingId ? "Guardar cambios" : "Crear producto"}
        </button>
        {editingId ? (
          <button onClick={resetForm} className="rounded-xl border border-merka-border px-3 py-2 text-xs text-zinc-200">
            Cancelar edicion
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {activeItems.map((item) => (
          <div key={item.id} className="rounded-xl border border-merka-border bg-merka-black p-3">
            <p className="text-sm font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-xs text-zinc-400">{item.description}</p>
            <p className="mt-1 text-xs text-zinc-300">
              Categoria: {item.categorySlug} · Precio: ${item.priceCOP.toLocaleString("es-CO")} · Estado: {item.status}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => startEdit(item)} className="rounded-lg bg-merka-yellow px-2 py-1 text-[11px] font-semibold text-merka-black">
                Editar
              </button>
              <button onClick={() => setStatus(item.id, "out_of_stock")} className="rounded-lg bg-merka-red px-2 py-1 text-[11px] text-white">
                Marcar agotado
              </button>
              <button onClick={() => setStatus(item.id, "inactive")} className="rounded-lg bg-zinc-700 px-2 py-1 text-[11px] text-white">
                Desactivar
              </button>
              <button onClick={() => setStatus(item.id, "active")} className="rounded-lg bg-merka-green px-2 py-1 text-[11px] text-white">
                Activar
              </button>
              <button onClick={() => remove(item.id)} className="rounded-lg border border-merka-border px-2 py-1 text-[11px] text-zinc-200">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
