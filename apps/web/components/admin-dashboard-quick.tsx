"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { aggregateSalesToday, subscribeOperationalOrders } from "../lib/orders-operational";
import { loadManagedProducts, subscribeCatalog, type ManagedProductRecord } from "../lib/catalog-merge";

function criticalStock(items: ManagedProductRecord[]) {
  return items.filter((p) => p.status === "active" && p.stockQty != null && p.stockQty > 0 && p.stockQty < 5);
}

export function AdminDashboardQuick() {
  const [today, setToday] = useState(aggregateSalesToday());
  const [critical, setCritical] = useState<ManagedProductRecord[]>([]);

  useEffect(() => {
    const refresh = () => {
      setToday(aggregateSalesToday());
      setCritical(criticalStock(loadManagedProducts()));
    };
    refresh();
    const u1 = subscribeOperationalOrders(refresh);
    const u2 = subscribeCatalog(refresh);
    return () => {
      u1();
      u2();
    };
  }, []);

  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-merka-border bg-merka-surface p-5"
      >
        <div className="flex items-center gap-2 text-merka-yellow">
          <TrendingUp className="h-5 w-5" />
          <h3 className="font-headline text-lg font-semibold text-white">Dashboard rapido</h3>
        </div>
        <p className="mt-1 text-xs text-zinc-500">Ventas registradas hoy (pedidos locales en este navegador).</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-merka-border bg-black/40 p-4">
            <p className="text-xs text-zinc-500">Pedidos hoy</p>
            <p className="mt-1 font-headline text-2xl font-bold text-white">{today.count}</p>
          </div>
          <div className="rounded-xl border border-merka-border bg-black/40 p-4">
            <p className="text-xs text-zinc-500">Total COP hoy</p>
            <p className="mt-1 font-headline text-xl font-bold text-merka-green">${today.revenue.toLocaleString("es-CO")}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="rounded-2xl border border-merka-red/40 bg-merka-surface p-5"
      >
        <div className="flex items-center gap-2 text-merka-red">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-headline text-lg font-semibold text-white">Stock critico</h3>
        </div>
        <p className="mt-1 text-xs text-zinc-500">Menos de 5 unidades (campo stock en catalogo admin).</p>
        <ul className="mt-3 max-h-44 space-y-2 overflow-y-auto text-sm">
          {critical.length === 0 ? <li className="text-zinc-500">Sin alertas de stock.</li> : null}
          {critical.map((p) => (
            <li key={p.id} className="flex justify-between gap-2 rounded-lg border border-merka-border bg-black/40 px-3 py-2 text-zinc-200">
              <span className="truncate font-medium text-white">{p.name}</span>
              <span className="shrink-0 font-semibold text-merka-red">{p.stockQty} u.</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
