"use client";

import { useEffect, useState } from "react";
import { aggregateSales, subscribeOperationalOrders } from "../lib/orders-operational";
import { loadWorkforceUsers, loadProfiles } from "../lib/workforce";
import { loadAllPresence, subscribePresence, type PresenceEntry } from "../lib/presence";

export function AdminOperationalInsights() {
  const [sales, setSales] = useState(aggregateSales());
  const [presence, setPresence] = useState<PresenceEntry[]>([]);

  useEffect(() => {
    const refreshSales = () => setSales(aggregateSales());
    refreshSales();
    return subscribeOperationalOrders(refreshSales);
  }, []);

  useEffect(() => {
    const refresh = () => setPresence(loadAllPresence());
    refresh();
    return subscribePresence(refresh);
  }, []);

  const users = loadWorkforceUsers().filter((u) => u.active && u.role !== "admin");
  const profiles = loadProfiles();

  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h3 className="font-headline text-lg font-semibold text-white">Pedidos y ventas (local)</h3>
        <p className="mt-1 text-xs text-zinc-400">Pedidos registrados desde checkout en este navegador.</p>
        <p className="mt-4 text-3xl font-bold text-merka-green">{sales.totalOrders}</p>
        <p className="text-xs text-zinc-500">Pedidos con seguimiento</p>
        <div className="mt-4 border-t border-merka-border pt-4">
          <p className="text-sm font-semibold text-white">Productos mas vendidos</p>
          <ul className="mt-2 space-y-1 text-xs text-zinc-300">
            {sales.byProduct.slice(0, 8).map((row) => (
              <li key={row.name} className="flex justify-between gap-2">
                <span className="truncate">{row.name}</span>
                <span className="shrink-0 text-merka-yellow">{row.qty} u.</span>
              </li>
            ))}
            {sales.byProduct.length === 0 ? <li className="text-zinc-500">Aun no hay lineas de pedido.</li> : null}
          </ul>
        </div>
      </div>
      <div className="rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h3 className="font-headline text-lg font-semibold text-white">Operativos en linea (aprox.)</h3>
        <p className="mt-1 text-xs text-zinc-400">Latido cada ~20s desde la app abierta (misma maquina o pestana).</p>
        <ul className="mt-4 space-y-2 text-xs">
          {presence.length === 0 ? <li className="text-zinc-500">Nadie activo en los ultimos 90s.</li> : null}
          {presence.map((p) => (
            <li key={p.username} className="rounded-lg border border-merka-border bg-merka-black px-3 py-2 text-zinc-200">
              <span className="font-semibold text-white">{p.displayName || p.username}</span> · {p.role} · {p.shift}
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-merka-border pt-4">
          <p className="text-sm font-semibold text-white">Datos guardados de turno</p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-zinc-400">
            {users.map((u) => {
              const pr = profiles.find((p) => p.username === u.username);
              return (
                <li key={u.id}>
                  {u.username} ({u.role}){pr ? ` · ${pr.displayName} · ${pr.shift}` : ""}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
