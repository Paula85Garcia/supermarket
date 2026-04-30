"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import {
  loadOperationalOrders,
  subscribeOperationalOrders,
  toggleOperationalLinePicked,
  updateOperationalOrder,
  type OperationalOrder
} from "../lib/orders-operational";

const btnYellow = "rounded-xl bg-merka-yellow px-3 py-2 text-xs font-semibold text-black transition hover:brightness-110 active:scale-[0.98]";

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
      <p className="mt-1 text-xs text-zinc-400">Marca cada producto al tomarlo del estante. Orden de llegada.</p>
      <div className="mt-4 space-y-4">
        {orders.length === 0 ? <p className="text-sm text-zinc-500">No hay pedidos en cola.</p> : null}
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-merka-border bg-black p-4">
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
                    Domiciliario reporto pago en caja. Confirma recepcion.
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {order.status === "new" ? (
                  <button type="button" onClick={() => setPicking(order.id)} className={btnYellow}>
                    Iniciar alistamiento
                  </button>
                ) : null}
                {order.status === "picking" ? (
                  <button type="button" onClick={() => setReady(order.id)} className={btnYellow}>
                    Listo para despacho
                  </button>
                ) : null}
                {order.status === "ready" ? <span className="text-xs text-merka-green">Esperando domiciliario</span> : null}
                {order.paymentMethod === "efectivo" && order.driverPaidPicker ? (
                  <button
                    type="button"
                    onClick={() => updateOperationalOrder(order.id, { pickerConfirmedDriverPayment: true })}
                    className="rounded-xl border border-merka-green px-3 py-2 text-xs font-semibold text-merka-green transition hover:bg-merka-green/10"
                  >
                    Confirmar pago del domiciliario
                  </button>
                ) : null}
              </div>
            </div>
            <ul className="mt-4 space-y-2 border-t border-merka-border pt-4">
              {order.items.map((line, idx) => {
                const done = Boolean(line.picked);
                return (
                  <motion.li
                    key={`${order.id}-${line.productId}-${idx}`}
                    layout
                    className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-2 transition ${
                      done ? "border-merka-green/40 bg-merka-green/5 opacity-60" : "border-merka-border bg-zinc-900/50 hover:border-merka-yellow/40"
                    }`}
                    onClick={() => order.status === "picking" && toggleOperationalLinePicked(order.id, idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && order.status === "picking") {
                        e.preventDefault();
                        toggleOperationalLinePicked(order.id, idx);
                      }
                    }}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-merka-border bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={line.imageUrl || "/favicon.ico"} alt="" className={`h-full w-full object-cover ${done ? "grayscale" : ""}`} />
                      <AnimatePresence>
                        {done ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/50"
                          >
                            <Check className="h-6 w-6 text-merka-green" strokeWidth={3} />
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${done ? "text-zinc-500 line-through" : "text-white"}`}>{line.name}</p>
                      <p className={`text-xs ${done ? "text-zinc-600 line-through" : "text-zinc-400"}`}>{line.description}</p>
                      <p className={`text-xs ${done ? "text-zinc-600" : "text-zinc-300"}`}>
                        x{line.quantity} · ${(line.unitPrice * line.quantity).toLocaleString("es-CO")}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
