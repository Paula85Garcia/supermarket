"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  loadAppNotifications,
  markAllAppNotificationsRead,
  markAppNotificationRead,
  subscribeAppNotifications,
  unreadAppNotificationsCount
} from "../lib/app-notifications";

type Props = {
  /** Conteo extra (p. ej. pedidos listos para domiciliario). */
  extraBadgeCount?: number;
};

export function NotificationBell({ extraBadgeCount = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const list = loadAppNotifications();
  const unread = unreadAppNotificationsCount();

  useEffect(() => subscribeAppNotifications(() => setTick((n) => n + 1)), []);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const totalBadge = unread + extraBadgeCount;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group relative cursor-pointer rounded-xl border border-merka-border bg-merka-surface p-2.5 text-zinc-300 transition hover:border-merka-yellow hover:bg-merka-yellow/10 hover:text-merka-yellow hover:shadow-[0_0_0_1px_rgba(255,215,0,0.15)] active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-merka-yellow/40"
        aria-label="Notificaciones"
        title={totalBadge > 0 ? `${totalBadge} sin leer` : "Notificaciones"}
      >
        <Bell size={18} className="transition group-hover:scale-105" />
        {totalBadge > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-merka-red px-1 text-[9px] font-bold text-white ring-1 ring-black/30">
            {totalBadge > 9 ? "9+" : totalBadge}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-[60] mt-2 w-[min(100vw-2rem,320px)] rounded-2xl border border-merka-border bg-merka-surface p-3 shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-merka-border pb-2">
            <p className="text-xs font-semibold text-white">Avisos</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => {
                  markAllAppNotificationsRead();
                  setTick((n) => n + 1);
                }}
                className="cursor-pointer text-[10px] font-semibold text-merka-yellow underline-offset-2 hover:underline"
              >
                Marcar leídas
              </button>
            ) : null}
          </div>
          <ul key={tick} className="max-h-64 space-y-2 overflow-y-auto py-2 text-xs">
            {list.length === 0 ? <li className="px-1 text-zinc-500">Sin notificaciones aún.</li> : null}
            {list.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    markAppNotificationRead(n.id);
                    setTick((x) => x + 1);
                  }}
                  className={`w-full rounded-lg border px-2 py-2 text-left transition hover:border-merka-yellow/50 hover:bg-merka-yellow/5 ${
                    n.read ? "border-transparent opacity-70" : "border-merka-yellow/30 bg-merka-yellow/5"
                  }`}
                >
                  <p className="font-semibold text-white">{n.title}</p>
                  <p className="mt-0.5 leading-snug text-zinc-400">{n.body}</p>
                  <p className="mt-1 text-[10px] text-zinc-600">{new Date(n.at).toLocaleString("es-CO")}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
