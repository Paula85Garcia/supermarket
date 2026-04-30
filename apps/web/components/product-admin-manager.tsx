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

function categoryLabel(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

const adminBtnPrimary =
  "cursor-pointer rounded-xl bg-merka-yellow px-3 py-2 text-xs font-semibold text-merka-black shadow-sm transition hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40";
const adminBtnGhost =
  "cursor-pointer rounded-xl border border-merka-border px-3 py-2 text-xs text-zinc-200 transition hover:border-merka-yellow hover:bg-merka-yellow/10 hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-merka-yellow/30";
const adminBtnDanger =
  "cursor-pointer rounded-lg bg-merka-red px-2 py-1 text-[11px] text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-merka-red/50";
const adminBtnMuted =
  "cursor-pointer rounded-lg bg-zinc-700 px-2 py-1 text-[11px] text-white transition hover:bg-zinc-600 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-zinc-500/40";
const adminBtnSuccess =
  "cursor-pointer rounded-lg bg-merka-green px-2 py-1 text-[11px] text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-merka-green/40";
const adminBtnOutline =
  "cursor-pointer rounded-lg border border-merka-border px-2 py-1 text-[11px] text-zinc-200 transition hover:border-merka-yellow hover:bg-merka-yellow/10 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-merka-yellow/30";
const adminBtnYellowSm =
  "cursor-pointer rounded-lg bg-merka-yellow px-2 py-1 text-[11px] font-semibold text-merka-black shadow-sm transition hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/30";

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
      <p className="mt-1 text-xs text-zinc-400">
        Cada producto pertenece a una <span className="font-semibold text-zinc-200">categoría del catálogo</span> (selector
        abajo). Nombre, precio, foto desde tu equipo. Opcional: promoción y stock.
      </p>
      <p className="mt-2 rounded-lg border border-merka-border bg-merka-black/50 px-3 py-2 text-[11px] leading-relaxed text-zinc-500">
        <span className="font-semibold text-zinc-300">Cloudinary:</span> define{" "}
        <code className="text-merka-yellow">CLOUDINARY_API_KEY</code> y{" "}
        <code className="text-merka-yellow">CLOUDINARY_API_SECRET</code> en el entorno de la app web (por ejemplo{" "}
        <code className="text-zinc-400">apps/web/.env.local</code>). Opcional:{" "}
        <code className="text-merka-yellow">CLOUDINARY_CLOUD_NAME</code> si no usas el nombre por defecto del proyecto.
      </p>

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
            className={`${adminBtnPrimary} inline-flex items-center justify-center gap-2 disabled:opacity-50`}
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
          title="Categoría del catálogo donde aparecerá el producto"
          className="cursor-pointer rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none transition hover:border-merka-yellow/50"
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
        <button type="button" onClick={submit} className={adminBtnPrimary}>
          {editingId ? "Guardar cambios" : "Crear producto"}
        </button>
        {editingId ? (
          <button type="button" onClick={resetForm} className={adminBtnGhost}>
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
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <span
                  className="rounded-full border border-merka-yellow/40 bg-merka-yellow/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-merka-yellow"
                  title="Categoría en el catálogo"
                >
                  {categoryLabel(item.categorySlug)}
                </span>
              </div>
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
                · <span className="text-zinc-500">{item.status}</span>
                {item.stockQty != null ? ` · ${item.stockQty} uds.` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => startEdit(item)} className={adminBtnYellowSm} title="Editar producto">
                Editar
              </button>
              <button type="button" onClick={() => setStatus(item.id, "out_of_stock")} className={adminBtnDanger} title="Marcar sin stock">
                Agotado
              </button>
              <button type="button" onClick={() => setStatus(item.id, "inactive")} className={adminBtnMuted} title="Ocultar del catálogo">
                Desactivar
              </button>
              <button type="button" onClick={() => setStatus(item.id, "active")} className={adminBtnSuccess} title="Visible en catálogo">
                Activar
              </button>
              <button type="button" onClick={() => remove(item.id)} className={adminBtnOutline} title="Quitar del catálogo admin">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
