"use client";

import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { useCart } from "../../lib/cart-context";

export default function CartPage() {
  const { items, subtotal, removeItem } = useCart();
  const deliveryFee = subtotal < 20000 && subtotal > 0 ? 2000 : 0;
  const total = subtotal + deliveryFee;
  const whatsappSummary = () => {
    const lines = items.map((item) => `- ${item.name} x${item.quantity} ($${(item.priceCOP * item.quantity).toLocaleString("es-CO")})`);
    const message =
      `Hola equipo de domicilios MERKAMAX.%0A` +
      `Resumen compra:%0A${lines.join("%0A")}%0A` +
      `Subtotal: $${subtotal.toLocaleString("es-CO")}%0A` +
      `Recargo domicilio: $${deliveryFee.toLocaleString("es-CO")}%0A` +
      `Total: $${total.toLocaleString("es-CO")}`;
    window.open(`https://wa.me/573053700491?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h2 className="font-headline text-2xl font-semibold text-white">Carrito</h2>
        {items.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">Tu carrito esta vacio.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-merka-border bg-merka-black p-3">
                <div>
                  <p className="text-sm text-white">{item.name}</p>
                  <p className="text-xs text-zinc-400">
                    {item.quantity} x ${item.priceCOP.toLocaleString("es-CO")}
                  </p>
                </div>
                <button onClick={() => removeItem(item.id)} className="rounded-lg bg-merka-red px-3 py-1 text-xs text-white">
                  Quitar
                </button>
              </div>
            ))}
            <div className="rounded-xl border border-merka-border bg-merka-black p-3 text-sm text-zinc-200">
              <p>Subtotal: ${subtotal.toLocaleString("es-CO")}</p>
              <p>Recargo domicilio: ${deliveryFee.toLocaleString("es-CO")}</p>
              <p className="mt-1 font-semibold text-merka-green">Total: ${total.toLocaleString("es-CO")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/checkout" className="inline-flex rounded-xl bg-merka-yellow px-4 py-2 text-sm font-semibold text-merka-black">
                Ir a checkout
              </Link>
              <button onClick={whatsappSummary} className="inline-flex rounded-xl bg-merka-green px-4 py-2 text-sm font-semibold text-white">
                Ir directo a WhatsApp
              </button>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
