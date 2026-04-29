"use client";

import { useMemo, useState, useEffect } from "react";
import { categories } from "../lib/data";
import {
  loadManagedProducts,
  saveManagedProducts,
  type ManagedProductRecord,
  type ManagedProductStatus
} from "../lib/catalog-merge";

export function ProductAdminManager() {
  const [items, setItems] = useState<ManagedProductRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categorySlug: categories[0]?.slug ?? "despensa",
    priceCOP: "0",
    imageUrl: "",
    onSale: false,
    promoPriceCOP: "",
    stockQty: ""
  });

  useEffect(() => {
    setItems(loadManagedProducts());
  }, []);

  const activeItems = useMemo(() => items.filter((item) => item.status !== "inactive"), [items]);

  const persist = (next: ManagedProductRecord[]) => {
    setItems(next);
    saveManagedProducts(next);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      categorySlug: categories[0]?.slug ?? "despensa",
      priceCOP: "0",
      imageUrl: "",
      onSale: false,
      promoPriceCOP: "",
      stockQty: ""
    });
  };

  const submit = () => {
    if (!form.name.trim() || !form.description.trim()) return;
    const price = Number(form.priceCOP);
    if (!Number.isFinite(price) || price <= 0) return;
    const promo = form.promoPriceCOP.trim() ? Number(form.promoPriceCOP) : null;
    if (form.onSale && (!promo || promo <= 0 || promo >= price)) return;
    const stockQtyParsed = form.stockQty.trim() === "" ? null : Number(form.stockQty);
    if (stockQtyParsed !== null && (!Number.isFinite(stockQtyParsed) || stockQtyParsed < 0)) return;
    const imageUrl = form.imageUrl.trim() || "https://res.cloudinary.com/dky2dscgr/image/upload/v1711111111/merkamax/leche.jpg";

    if (editingId) {
      persist(
        items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: form.name.trim(),
                description: form.description.trim(),
                categorySlug: form.categorySlug,
                priceCOP: price,
                imageUrl,
                onSale: form.onSale,
                promoPriceCOP: form.onSale ? promo : null,
                stockQty: stockQtyParsed
              }
            : item
        )
      );
      resetForm();
      return;
    }

    const created: ManagedProductRecord = {
      id: `p-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      categorySlug: form.categorySlug,
      priceCOP: price,
      imageUrl,
      status: "active",
      onSale: form.onSale,
      promoPriceCOP: form.onSale ? promo : null,
      stockQty: stockQtyParsed
    };
    persist([created, ...items]);
    resetForm();
  };

  const startEdit = (item: ManagedProductRecord) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      categorySlug: item.categorySlug,
      priceCOP: String(item.priceCOP),
      imageUrl: item.imageUrl,
      onSale: item.onSale,
      promoPriceCOP: item.promoPriceCOP != null ? String(item.promoPriceCOP) : "",
      stockQty: item.stockQty != null ? String(item.stockQty) : ""
    });
  };

  const setStatus = (id: string, status: ManagedProductStatus) => {
    persist(items.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const remove = (id: string) => {
    persist(items.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <section className="mt-5 rounded-2xl border border-merka-border bg-merka-surface p-5">
      <h3 className="font-headline text-lg font-semibold text-white">Crear y gestionar productos</h3>
      <p className="mt-1 text-xs text-zinc-400">
        Edita imagen (URL), nombre, precio, promo, stock opcional o agotado. Sin stock en campo = no se muestra cantidad.
      </p>

      <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
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
        <input
          value={form.imageUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
          placeholder="URL imagen (Cloudinary u otra)"
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
          placeholder="Precio normal (COP)"
        />
        <label className="flex items-center gap-2 rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={form.onSale}
            onChange={(e) => setForm((prev) => ({ ...prev, onSale: e.target.checked }))}
            className="accent-merka-yellow"
          />
          En promocion
        </label>
        {form.onSale ? (
          <input
            value={form.promoPriceCOP}
            onChange={(e) => setForm((prev) => ({ ...prev, promoPriceCOP: e.target.value }))}
            className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
            placeholder="Precio promo (COP, menor al normal)"
          />
        ) : null}
        <input
          value={form.stockQty}
          onChange={(e) => setForm((prev) => ({ ...prev, stockQty: e.target.value }))}
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
          placeholder="Cantidad en bodega (opcional, vacio = no mostrar)"
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
          <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-merka-border bg-merka-black p-3 md:flex-row md:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-merka-border object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{item.name}</p>
              <p className="mt-1 text-xs text-zinc-400">{item.description}</p>
              <p className="mt-1 text-xs text-zinc-300">
                {item.onSale && item.promoPriceCOP ? (
                  <>
                    <span className="text-merka-yellow">${item.promoPriceCOP.toLocaleString("es-CO")} promo</span>
                    <span className="ml-2 line-through opacity-60">${item.priceCOP.toLocaleString("es-CO")}</span>
                  </>
                ) : (
                  <>${item.priceCOP.toLocaleString("es-CO")}</>
                )}{" "}
                · {item.categorySlug} · {item.status}
                {item.stockQty != null ? ` · ${item.stockQty} uds.` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => startEdit(item)} className="rounded-lg bg-merka-yellow px-2 py-1 text-[11px] font-semibold text-merka-black">
                Editar
              </button>
              <button onClick={() => setStatus(item.id, "out_of_stock")} className="rounded-lg bg-merka-red px-2 py-1 text-[11px] text-white">
                Agotado
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
