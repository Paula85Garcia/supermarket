"use client";

import { useEffect, useState } from "react";
import {
  loadOperationalOrders,
  subscribeOperationalOrders,
  updateOperationalOrder,
  type OperationalOrder
} from "../lib/orders-operational";

export function PickerOrderQueue() {
  const [orders, setOrders] = useState<OperationalOrder[]>([]);

  useEffect(() => {
    const refresh = () => {
      const all = loadOperationalOrders()
        .filter((o) => o.status === "new" || o.status === "picking" || o.status === "ready")
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setOrders(all);
    };
    refresh();
    return subscribeOperationalOrders(refresh);
  }, []);

  const setPicking = (id: string) => updateOperationalOrder(id, { status: "picking" });
  const setReady = (id: string) => updateOperationalOrder(id, { status: "ready" });

  return (
    <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
      <h3 className="font-headline text-lg font-semibold text-white">Pedidos entrantes</h3>
      <p className="mt-1 text-xs text-zinc-400">Orden de llegada (mas antiguo primero). Marca listo para despacho.</p>
      <div className="mt-4 space-y-4">
        {orders.length === 0 ? <p className="text-sm text-zinc-500">No hay pedidos en cola.</p> : null}
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-merka-border bg-merka-black p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-headline text-sm font-semibold text-white">Pedido #{order.id}</p>
                <p className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleString("es-CO")}</p>
                <p className="mt-2 text-sm text-zinc-200">
                  Cliente: {order.customerName} · Tel: {order.customerPhone}
                </p>
                <p className="text-xs text-zinc-400">Pago: {order.paymentMethod}</p>
                {order.paymentMethod === "efectivo" && order.driverPaidPicker && !order.pickerConfirmedDriverPayment ? (
                  <p className="mt-2 rounded-lg border border-merka-yellow/40 bg-merka-yellow/10 px-2 py-1 text-xs text-merka-yellow">
                    Domiciliario reporto pago en caja. Confirma que recibiste el dinero.
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {order.status === "new" ? (
                  <button type="button" onClick={() => setPicking(order.id)} className="rounded-lg bg-merka-yellow px-3 py-1 text-xs font-semibold text-merka-black">
                    Iniciar alistamiento
                  </button>
                ) : null}
                {order.status === "picking" ? (
                  <button type="button" onClick={() => setReady(order.id)} className="rounded-lg bg-merka-green px-3 py-1 text-xs font-semibold text-white">
                    Listo para despacho
                  </button>
                ) : null}
                {order.status === "ready" ? <span className="text-xs text-merka-green">Esperando domiciliario</span> : null}
                {order.paymentMethod === "efectivo" && order.driverPaidPicker ? (
                  <button
                    type="button"
                    onClick={() => updateOperationalOrder(order.id, { pickerConfirmedDriverPayment: true })}
                    className="rounded-lg border border-merka-green px-3 py-1 text-xs text-merka-green"
                  >
                    Confirmar pago recibido del domiciliario
                  </button>
                ) : null}
              </div>
            </div>
            <ul className="mt-4 space-y-3 border-t border-merka-border pt-4">
              {order.items.map((line) => (
                <li key={`${order.id}-${line.productId}-${line.name}`} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={line.imageUrl || "/favicon.ico"} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-merka-border object-cover" />
                  <div>
                    <p className="text-sm font-medium text-white">{line.name}</p>
                    <p className="text-xs text-zinc-400">{line.description}</p>
                    <p className="text-xs text-zinc-300">
                      x{line.quantity} · ${(line.unitPrice * line.quantity).toLocaleString("es-CO")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
