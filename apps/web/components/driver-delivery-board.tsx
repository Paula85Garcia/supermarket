"use client";

import { useEffect, useState } from "react";
import {
  loadOperationalOrders,
  subscribeOperationalOrders,
  updateOperationalOrder,
  type OperationalOrder
} from "../lib/orders-operational";
import { setDriverChatCustomerPhone } from "../lib/driver-chat-target";

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

  const select = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  const startDelivery = (id: string) => updateOperationalOrder(id, { status: "delivering" });
  const finishDelivery = (id: string) => updateOperationalOrder(id, { status: "done" });
  const markCashReceived = (id: string) => updateOperationalOrder(id, { driverReceivedCash: true });
  const markPaidPicker = (id: string) => updateOperationalOrder(id, { driverPaidPicker: true });

  return (
    <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-headline text-lg font-semibold text-white">Entregas</h3>
        {pendingReady > 0 ? (
          <span className="rounded-full bg-merka-red px-3 py-1 text-xs font-bold text-white">{pendingReady} listos</span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-zinc-400">
        Direccion, cliente, telefono y estado de pago. En efectivo confirma cobro al entregar; al volver registra pago al alistador.
      </p>
      <div className="mt-4 space-y-4">
        {orders.length === 0 ? <p className="text-sm text-zinc-500">No hay entregas pendientes.</p> : null}
        {orders.map((order) => {
          const selected = selectedId === order.id;
          const cash = order.paymentMethod === "efectivo";
          const paidOnline = order.paymentMethod === "tarjeta" || order.paymentMethod === "transferencia";
          return (
            <article
              key={order.id}
              className={`rounded-xl border p-4 ${selected ? "border-merka-yellow bg-merka-yellow/5" : "border-merka-border bg-merka-black"}`}
            >
              <button type="button" onClick={() => select(order.id)} className="w-full text-left">
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
                  <span className="text-zinc-500">Ventana entrega:</span> {order.deliveryWindow || "—"}
                </p>
                <p>
                  <span className="text-zinc-500">Total:</span> ${order.total.toLocaleString("es-CO")}
                </p>
                <p>
                  <span className="text-zinc-500">Pago:</span>{" "}
                  {paidOnline ? "Ya pagado en linea" : cash ? (order.driverReceivedCash ? "Efectivo cobrado en destino" : "Debe pagar en efectivo al recibir") : `Estado: ${order.paymentMethod}`}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {order.status === "ready" ? (
                  <button type="button" onClick={() => startDelivery(order.id)} className="rounded-lg bg-merka-yellow px-3 py-1 text-xs font-semibold text-merka-black">
                    Salir a entregar
                  </button>
                ) : null}
                {order.status === "delivering" && cash && !order.driverReceivedCash ? (
                  <button type="button" onClick={() => markCashReceived(order.id)} className="rounded-lg bg-merka-green px-3 py-1 text-xs font-semibold text-white">
                    Ya recibi el pago en efectivo
                  </button>
                ) : null}
                {order.status === "delivering" && (!cash || order.driverReceivedCash) ? (
                  <button type="button" onClick={() => finishDelivery(order.id)} className="rounded-lg bg-merka-red px-3 py-1 text-xs font-semibold text-white">
                    Entrega finalizada
                  </button>
                ) : null}
                {order.status === "delivering" && cash && order.driverReceivedCash && !order.driverPaidPicker ? (
                  <button type="button" onClick={() => markPaidPicker(order.id)} className="rounded-lg border border-merka-yellow px-3 py-1 text-xs text-merka-yellow">
                    Ya pague al alistador en tienda
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
