"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { ImagePlus } from "lucide-react";
import { categories, MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE } from "../lib/data";
import {
  loadManagedProducts,
  saveManagedProducts,
  type ManagedProductRecord,
  type ManagedProductStatus
} from "../lib/catalog-merge";

function alertMsg(message: string): void {
  window.alert(message);
}

export function ProductAdminManager() {
  const [items, setItems] = useState<ManagedProductRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categorySlug: categories[0]?.slug ?? "despensa",
    priceCOP: "",
    imageUrl: "",
    onSale: false,
    promoPriceCOP: "",
    stockQty: ""
  });

  useEffect(() => {
    setItems(loadManagedProducts());
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      categorySlug: categories[0]?.slug ?? "despensa",
      priceCOP: "",
      imageUrl: "",
      onSale: false,
      promoPriceCOP: "",
      stockQty: ""
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onPickImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", `merkamax/products/${new Date().getFullYear()}`);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const json = (await res.json()) as { data?: { secure_url?: string }; error?: { message?: string } };
      if (!res.ok || !json.data?.secure_url) {
        alertMsg(json.error?.message ?? "No se pudo subir la imagen. Revisa la conexión o vuelve a intentar.");
        return;
      }
      setForm((prev) => ({ ...prev, imageUrl: json.data!.secure_url! }));
    } catch {
      alertMsg("Error de red al subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    const name = form.name.trim();
    if (!name) {
      alertMsg("Escribe el nombre del producto.");
      return;
    }
    const description = form.description.trim() || name;
    const price = Number(form.priceCOP.replace(/\D/g, "") || "0");
    if (!Number.isFinite(price) || price <= 0) {
      alertMsg("Indica un precio normal válido (solo números).");
      return;
    }
    const promo = form.promoPriceCOP.trim() ? Number(form.promoPriceCOP.replace(/\D/g, "")) : null;
    if (form.onSale) {
      if (!promo || promo <= 0 || promo >= price) {
        alertMsg("En promoción: el precio oferta debe ser menor que el precio normal.");
        return;
      }
    }
    const stockQtyParsed = form.stockQty.trim() === "" ? null : Number(form.stockQty);
    if (stockQtyParsed !== null && (!Number.isFinite(stockQtyParsed) || stockQtyParsed < 0)) {
      alertMsg("Cantidad en bodega no válida.");
      return;
    }
    const imageUrl = form.imageUrl.trim() || MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE;

    setItems((prev) => {
      let next: ManagedProductRecord[];
      if (editingId) {
        next = prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name,
                description,
                categorySlug: form.categorySlug,
                priceCOP: price,
                imageUrl,
                onSale: form.onSale,
                promoPriceCOP: form.onSale ? promo : null,
                stockQty: stockQtyParsed
              }
            : item
        );
      } else {
        const created: ManagedProductRecord = {
          id: `p-${Date.now()}`,
          name,
          description,
          categorySlug: form.categorySlug,
          priceCOP: price,
          imageUrl,
          status: "active",
          onSale: form.onSale,
          promoPriceCOP: form.onSale ? promo : null,
          stockQty: stockQtyParsed
        };
        next = [created, ...prev];
      }
      saveManagedProducts(next);
      return next;
    });
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setStatus = (id: string, status: ManagedProductStatus) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, status } : item));
      saveManagedProducts(next);
      return next;
    });
  };

  const remove = (id: string) => {
    if (!window.confirm("¿Eliminar este producto del catálogo administrado?")) return;
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveManagedProducts(next);
      return next;
    });
    if (editingId === id) resetForm();
  };

  const sortedItems = useMemo(() => {
    const rank: Record<ManagedProductStatus, number> = { active: 0, out_of_stock: 1, inactive: 2 };
    return [...items].sort((a, b) => rank[a.status] - rank[b.status]);
  }, [items]);

  return (
    <section className="mt-5 rounded-2xl border border-merka-border bg-merka-surface p-5">
      <h3 className="font-headline text-lg font-semibold text-white">Crear y gestionar productos</h3>
      <p className="mt-1 text-xs text-zinc-400">Nombre, precio, categoría. Foto desde tu equipo. Opcional: promoción y stock.</p>

      <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        <input
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
          placeholder="Nombre del producto"
        />
        <input
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
          placeholder="Descripción (opcional)"
        />
        <div className="flex flex-col gap-1 rounded-xl border border-merka-border bg-merka-black px-3 py-2">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Foto del producto</label>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-merka-yellow px-3 py-2 text-xs font-semibold text-merka-black disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" aria-hidden />
            {uploading ? "Subiendo…" : form.imageUrl ? "Cambiar foto" : "Elegir foto"}
          </button>
          {form.imageUrl ? (
            <p className="truncate text-[10px] text-merka-green">Foto lista</p>
          ) : (
            <p className="text-[10px] text-zinc-500">Sin foto aún: se usará imagen por defecto.</p>
          )}
        </div>
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
          inputMode="numeric"
        />
        <label className="flex items-center gap-2 rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={form.onSale}
            onChange={(e) => setForm((prev) => ({ ...prev, onSale: e.target.checked }))}
            className="accent-merka-yellow"
          />
          En promoción
        </label>
        {form.onSale ? (
          <input
            value={form.promoPriceCOP}
            onChange={(e) => setForm((prev) => ({ ...prev, promoPriceCOP: e.target.value }))}
            className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
            placeholder="Precio oferta (COP)"
            inputMode="numeric"
          />
        ) : null}
        <input
          value={form.stockQty}
          onChange={(e) => setForm((prev) => ({ ...prev, stockQty: e.target.value }))}
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
          placeholder="Stock en bodega (opcional)"
          inputMode="numeric"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={submit} className="rounded-xl bg-merka-yellow px-3 py-2 text-xs font-semibold text-merka-black">
          {editingId ? "Guardar cambios" : "Crear producto"}
        </button>
        {editingId ? (
          <button type="button" onClick={resetForm} className="rounded-xl border border-merka-border px-3 py-2 text-xs text-zinc-200">
            Cancelar edición
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {sortedItems.length === 0 ? <p className="text-sm text-zinc-500">No hay productos en el catálogo admin.</p> : null}
        {sortedItems.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-merka-border bg-merka-black p-3 md:flex-row md:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`${item.id}-${item.imageUrl}`}
              src={item.imageUrl}
              alt=""
              width={64}
              height={64}
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-16 w-16 shrink-0 rounded-lg border border-merka-border bg-zinc-900 object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = MERKAMAX_PRODUCT_PLACEHOLDER_IMAGE;
              }}
            />
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
              <button type="button" onClick={() => startEdit(item)} className="rounded-lg bg-merka-yellow px-2 py-1 text-[11px] font-semibold text-merka-black">
                Editar
              </button>
              <button type="button" onClick={() => setStatus(item.id, "out_of_stock")} className="rounded-lg bg-merka-red px-2 py-1 text-[11px] text-white">
                Agotado
              </button>
              <button type="button" onClick={() => setStatus(item.id, "inactive")} className="rounded-lg bg-zinc-700 px-2 py-1 text-[11px] text-white">
                Desactivar
              </button>
              <button type="button" onClick={() => setStatus(item.id, "active")} className="rounded-lg bg-merka-green px-2 py-1 text-[11px] text-white">
                Activar
              </button>
              <button type="button" onClick={() => remove(item.id)} className="rounded-lg border border-merka-border px-2 py-1 text-[11px] text-zinc-200">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
