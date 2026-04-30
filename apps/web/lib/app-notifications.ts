"use client";

import type { OperationalOrder } from "./orders-operational";

export type AppNotificationType = "promo" | "order_delivered" | "order_delayed" | "system";

export interface AppNotification {
  id: string;
  at: string;
  read: boolean;
  type: AppNotificationType;
  title: string;
  body: string;
}

const STORAGE_KEY = "mkx_app_notifications";
const CHANNEL = "mkx_app_notifications";
const SLA_WARNED_KEY = "mkx_sla_warned_order_ids";
const MAX_ITEMS = 40;
const SLA_MS = 30 * 60 * 1000;

function broadcast(): void {
  if (typeof BroadcastChannel === "undefined") return;
  const ch = new BroadcastChannel(CHANNEL);
  ch.postMessage("sync");
  ch.close();
}

export function loadAppNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

function saveAppNotifications(list: AppNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
  broadcast();
}

export function subscribeAppNotifications(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  let ch: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = () => onChange();
  }
  return () => {
    window.removeEventListener("storage", onStorage);
    ch?.close();
  };
}

export function pushAppNotification(input: {
  type: AppNotificationType;
  title: string;
  body: string;
  id?: string;
}): void {
  const id = input.id ?? `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const next: AppNotification = {
    id,
    at: new Date().toISOString(),
    read: false,
    type: input.type,
    title: input.title,
    body: input.body
  };
  const prev = loadAppNotifications();
  if (prev.some((p) => p.id === id)) return;
  saveAppNotifications([next, ...prev]);
}

export function markAppNotificationRead(id: string): void {
  const prev = loadAppNotifications();
  saveAppNotifications(prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
}

export function markAllAppNotificationsRead(): void {
  const prev = loadAppNotifications();
  saveAppNotifications(prev.map((n) => ({ ...n, read: true })));
}

export function unreadAppNotificationsCount(): number {
  return loadAppNotifications().filter((n) => !n.read).length;
}

export function notifyOrderDelivered(orderId: string): void {
  pushAppNotification({
    id: `delivered-${orderId}`,
    type: "order_delivered",
    title: "Pedido entregado",
    body: `El pedido #${orderId} quedó como entregado.`
  });
}

function loadSlaWarnedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SLA_WARNED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSlaWarnedIds(ids: Set<string>): void {
  localStorage.setItem(SLA_WARNED_KEY, JSON.stringify([...ids]));
}

/** Pedidos en new/picking con más de 30 min sin avanzar (una alerta por pedido). */
export function scanAndNotifyDelayedOrders(orders: OperationalOrder[]): void {
  const warned = loadSlaWarnedIds();
  const now = Date.now();
  let changed = false;
  for (const o of orders) {
    if (o.status !== "new" && o.status !== "picking") continue;
    if (now - new Date(o.createdAt).getTime() < SLA_MS) continue;
    if (warned.has(o.id)) continue;
    warned.add(o.id);
    changed = true;
    pushAppNotification({
      id: `delayed-${o.id}`,
      type: "order_delayed",
      title: "Pedido demorado",
      body: `El pedido #${o.id} lleva más de 30 minutos en estado "${o.status === "new" ? "nuevo" : "alistando"}". Revisa el panel.`
    });
  }
  if (changed) saveSlaWarnedIds(warned);
}

export function maybePushPromoDigestOncePerSession(productOnSaleCount: number): void {
  if (typeof window === "undefined" || productOnSaleCount <= 0) return;
  const k = "mkx_promo_bell_session";
  if (sessionStorage.getItem(k)) return;
  sessionStorage.setItem(k, "1");
  pushAppNotification({
    type: "promo",
    title: "Promociones activas",
    body: `Hay ${productOnSaleCount} producto${productOnSaleCount === 1 ? "" : "s"} con precio especial en el catálogo. Mira la sección Ofertas.`
  });
}
