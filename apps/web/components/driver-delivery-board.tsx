"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  advanceDriverRouteStatus,
  loadOperationalOrders,
  subscribeOperationalOrders,
  updateOperationalOrder,
  type DriverRouteStatus,
  type OperationalOrder
} from "../lib/orders-operational";
import { setDriverChatCustomerPhone } from "../lib/driver-chat-target";

const routeLabels: Record<DriverRouteStatus, string> = {
  en_camino: "En camino",
  en_puerta: "En la puerta",
  entregado: "Entregado"
};

function routeBadgeClass(active: boolean, status: DriverRouteStatus): string {
  if (!active) return "border-merka-border bg-zinc-900/80 text-zinc-500";
  if (status === "en_camino") return "border-merka-yellow bg-merka-yellow/15 text-merka-yellow";
  if (status === "en_puerta") return "border-amber-400/80 bg-amber-500/15 text-amber-300";
  return "border-merka-green bg-merka-green/15 text-merka-green";
}

const btnYellow = "rounded-xl bg-merka-yellow px-3 py-2 text-xs font-semibold text-black transition hover:brightness-110 active:scale-[0.98]";

export function DriverDeliveryBoard() {
  const [orders, setOrders] = useState<OperationalOrder[]>([]);
  const [pendingReady, setPendingReady] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      const all = loadOperationalOrders();
      setPendingReady(all.filter((o) => o.status === "ready").length);
      const mine = all
        .filter((o) => o.status === "ready" || o.status === "delivering")
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setOrders(mine);
    };
    refresh();
    return subscribeOperationalOrders(refresh);
  }, []);

  useEffect(() => {
    const o = orders.find((x) => x.id === selectedId);
    setDriverChatCustomerPhone(o?.customerPhone ?? null);
    return () => setDriverChatCustomerPhone(null);
  }, [selectedId, orders]);

  const startDelivery = (id: string) => updateOperationalOrder(id, { status: "delivering", driverRouteStatus: "en_camino" });
  const finishDelivery = (id: string) => updateOperationalOrder(id, { status: "done", driverRouteStatus: "entregado" });
  const markCashReceived = (id: string) => updateOperationalOrder(id, { driverReceivedCash: true });
  const markPaidPicker = (id: string) => updateOperationalOrder(id, { driverPaidPicker: true });

  return (
    <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-headline text-lg font-semibold text-white">Entregas asignadas</h3>
        {pendingReady > 0 ? (
          <span className="rounded-full bg-merka-red px-3 py-1 text-xs font-bold text-white">{pendingReady} listos</span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-zinc-400">Avanza el estado de ruta con el boton amarillo. Colores: amarillo en camino, ambar en puerta, verde entregado.</p>
      <div className="mt-4 space-y-4">
        {orders.length === 0 ? <p className="text-sm text-zinc-500">No hay entregas pendientes.</p> : null}
        {orders.map((order) => {
          const selected = selectedId === order.id;
          const cash = order.paymentMethod === "efectivo";
          const paidOnline = order.paymentMethod === "tarjeta" || order.paymentMethod === "transferencia";
          const route = order.driverRouteStatus ?? "en_camino";
          return (
            <motion.article
              key={order.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-4 ${selected ? "border-merka-yellow bg-merka-yellow/5" : "border-merka-border bg-black"}`}
            >
              <button type="button" onClick={() => setSelectedId(selected ? null : order.id)} className="w-full text-left">
                <p className="font-headline text-sm font-semibold text-white">#{order.id}</p>
                <p className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleString("es-CO")}</p>
              </button>
              <div className="mt-3 space-y-1 text-sm text-zinc-200">
                <p>
                  <span className="text-zinc-500">Cliente:</span> {order.customerName}
                </p>
                <p>
                  <span className="text-zinc-500">Telefono:</span>{" "}
                  <a href={`tel:${order.customerPhone}`} className="text-merka-yellow underline">
                    {order.customerPhone}
                  </a>
                </p>
                <p>
                  <span className="text-zinc-500">Direccion:</span> {order.address}
                </p>
                <p>
                  <span className="text-zinc-500">Ventana:</span> {order.deliveryWindow || "—"}
                </p>
                <p>
                  <span className="text-zinc-500">Total:</span> ${order.total.toLocaleString("es-CO")}
                </p>
                <p>
                  <span className="text-zinc-500">Pago:</span>{" "}
                  {paidOnline ? "Pagado en linea" : cash ? (order.driverReceivedCash ? "Efectivo cobrado" : "Cobrar en efectivo") : order.paymentMethod}
                </p>
              </div>

              {order.status === "delivering" ? (
                <div className="mt-4 space-y-3 border-t border-merka-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Estado de ruta</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(routeLabels) as DriverRouteStatus[]).map((k) => (
                      <span
                        key={k}
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${routeBadgeClass(route === k, k)}`}
                      >
                        {routeLabels[k]}
                      </span>
                    ))}
                  </div>
                  {route !== "entregado" ? (
                    <button type="button" onClick={() => advanceDriverRouteStatus(order.id)} className={btnYellow}>
                      Siguiente:{" "}
                      {route === "en_camino" ? routeLabels.en_puerta : route === "en_puerta" ? routeLabels.entregado : routeLabels.en_camino}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                {order.status === "ready" ? (
                  <button type="button" onClick={() => startDelivery(order.id)} className={btnYellow}>
                    Salir a entregar
                  </button>
                ) : null}
                {order.status === "delivering" && cash && !order.driverReceivedCash ? (
                  <button type="button" onClick={() => markCashReceived(order.id)} className="rounded-xl bg-merka-green px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110">
                    Ya recibi efectivo
                  </button>
                ) : null}
                {order.status === "delivering" && route === "entregado" && (!cash || order.driverReceivedCash) ? (
                  <button type="button" onClick={() => finishDelivery(order.id)} className="rounded-xl bg-merka-red px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110">
                    Cerrar entrega
                  </button>
                ) : null}
                {order.status === "delivering" && cash && order.driverReceivedCash && !order.driverPaidPicker ? (
                  <button type="button" onClick={() => markPaidPicker(order.id)} className={`${btnYellow} border border-black/20`}>
                    Pague al alistador
                  </button>
                ) : null}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
