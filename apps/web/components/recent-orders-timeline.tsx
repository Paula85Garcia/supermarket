"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Circle, Package, Truck } from "lucide-react";
import { loadOperationalOrders, subscribeOperationalOrders, type OperationalOrder } from "../lib/orders-operational";

type StepState = "done" | "current" | "pending";

function buildSteps(o: OperationalOrder): { label: string; state: StepState }[] {
  const nodes = [
    { label: "Pedido recibido" },
    { label: "En preparacion" },
    { label: "Listo para domicilio" },
    { label: "En camino" },
    { label: "En la puerta" },
    { label: "Entregado" }
  ];
  let cur = 0;
  if (o.status === "new") cur = 0;
  else if (o.status === "picking") cur = 1;
  else if (o.status === "ready") cur = 2;
  else if (o.status === "delivering") {
    const r = o.driverRouteStatus ?? "en_camino";
    if (r === "en_camino") cur = 3;
    else if (r === "en_puerta") cur = 4;
    else cur = 5;
  } else if (o.status === "done") cur = 5;

  return nodes.map((n, i) => ({
    label: n.label,
    state: i < cur ? "done" : i === cur ? "current" : "pending"
  }));
}

function StepIcon({ state }: { state: StepState }) {
  if (state === "done") return <Check className="h-4 w-4 text-merka-green" strokeWidth={2.5} />;
  if (state === "current") return <Truck className="h-4 w-4 text-merka-yellow" />;
  return <Circle className="h-4 w-4 text-zinc-600" />;
}

export function RecentOrdersTimeline() {
  const [orders, setOrders] = useState<OperationalOrder[]>([]);

  useEffect(() => {
    const refresh = () =>
      setOrders(
        loadOperationalOrders()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6)
      );
    refresh();
    return subscribeOperationalOrders(refresh);
  }, []);

  if (!orders.length) {
    return (
      <div className="mt-4 rounded-xl border border-merka-border bg-black/30 p-4 text-sm text-zinc-500">
        Aun no hay pedidos en este dispositivo. Cuando compres, veras aqui el estado del envio.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-5">
      {orders.map((o, oi) => {
        const steps = buildSteps(o);
        return (
          <motion.article
            key={o.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: oi * 0.05, duration: 0.3 }}
            className="rounded-xl border border-merka-border bg-black/40 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-headline text-sm font-semibold text-white">Pedido #{o.id}</p>
              <span className="text-xs text-zinc-500">{new Date(o.createdAt).toLocaleDateString("es-CO")}</span>
            </div>
            <div className="relative mt-4 pl-1">
              {steps.map((step, i) => (
                <div key={`${o.id}-${step.label}`} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < steps.length - 1 ? (
                    <span
                      className={`absolute left-[15px] top-8 h-[calc(100%-12px)] w-px ${
                        step.state === "done" ? "bg-merka-green/50" : "bg-zinc-800"
                      }`}
                    />
                  ) : null}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-merka-border bg-merka-surface">
                    <StepIcon state={step.state} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={`text-sm font-medium ${
                        step.state === "current" ? "text-merka-yellow" : step.state === "done" ? "text-zinc-200" : "text-zinc-600"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.state === "current" ? <p className="text-xs text-zinc-500">Estado actual del envio</p> : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
              <Package className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
              <span>
                {o.items.length} lineas · ${o.total.toLocaleString("es-CO")}
              </span>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
