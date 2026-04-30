"use client";

import { notifyOrderDelivered } from "./app-notifications";

export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia" | "pendiente";

export interface OperationalLineItem {
  productId: string;
  name: string;
  description: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  /** Marcado por el picker al alistar */
  picked?: boolean;
}

export type DriverRouteStatus = "en_camino" | "en_puerta" | "entregado";

export interface OperationalOrder {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: PaymentMethod;
  deliveryWindow: string;
  items: OperationalLineItem[];
  total: number;
  status: "new" | "picking" | "ready" | "delivering" | "done";
  driverReceivedCash: boolean;
  driverPaidPicker: boolean;
  pickerConfirmedDriverPayment: boolean;
  /** Ruta del domiciliario (solo en reparto) */
  driverRouteStatus?: DriverRouteStatus;
}

const STORAGE_KEY = "mkx_operational_orders";
const CHANNEL = "mkx_operational_orders";

function broadcast(): void {
  if (typeof BroadcastChannel === "undefined") return;
  const ch = new BroadcastChannel(CHANNEL);
  ch.postMessage("sync");
  ch.close();
}

export function loadOperationalOrders(): OperationalOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as OperationalOrder[];
  } catch {
    return [];
  }
}

function saveOperationalOrders(orders: OperationalOrder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  broadcast();
}

export function subscribeOperationalOrders(onChange: () => void): () => void {
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

export function appendOperationalOrder(order: Omit<OperationalOrder, "status" | "driverReceivedCash" | "driverPaidPicker" | "pickerConfirmedDriverPayment">): void {
  const prev = loadOperationalOrders();
  const settledOnline = order.paymentMethod === "tarjeta" || order.paymentMethod === "transferencia";
  const full: OperationalOrder = {
    ...order,
    status: "new",
    driverReceivedCash: settledOnline,
    driverPaidPicker: settledOnline,
    pickerConfirmedDriverPayment: settledOnline,
    items: order.items.map((line) => ({ ...line, picked: line.picked ?? false }))
  };
  saveOperationalOrders([full, ...prev]);
}

export function updateOperationalOrder(id: string, patch: Partial<OperationalOrder>): void {
  const prev = loadOperationalOrders();
  const old = prev.find((o) => o.id === id);
  const next = prev.map((o) => (o.id === id ? { ...o, ...patch } : o));
  saveOperationalOrders(next);
  const updated = next.find((o) => o.id === id);
  if (updated?.status === "done" && old?.status !== "done") {
    notifyOrderDelivered(updated.id);
  }
}

export function toggleOperationalLinePicked(orderId: string, lineIndex: number): void {
  const prev = loadOperationalOrders();
  saveOperationalOrders(
    prev.map((o) => {
      if (o.id !== orderId) return o;
      const items = o.items.map((line, i) => (i === lineIndex ? { ...line, picked: !line.picked } : line));
      return { ...o, items };
    })
  );
}

export function advanceDriverRouteStatus(orderId: string): void {
  const o = getOperationalOrder(orderId);
  if (!o || o.status !== "delivering") return;
  const seq: DriverRouteStatus[] = ["en_camino", "en_puerta", "entregado"];
  const cur = o.driverRouteStatus ?? "en_camino";
  const idx = seq.indexOf(cur);
  const next = idx < 0 ? "en_puerta" : seq[Math.min(idx + 1, seq.length - 1)]!;
  updateOperationalOrder(orderId, { driverRouteStatus: next });
}

export function getOperationalOrder(id: string): OperationalOrder | undefined {
  return loadOperationalOrders().find((o) => o.id === id);
}

export function aggregateSalesToday(): { count: number; revenue: number } {
  const orders = loadOperationalOrders();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const t0 = start.getTime();
  let count = 0;
  let revenue = 0;
  for (const o of orders) {
    if (new Date(o.createdAt).getTime() >= t0) {
      count += 1;
      revenue += o.total;
    }
  }
  return { count, revenue };
}

export function aggregateSales(): { totalOrders: number; byProduct: { name: string; qty: number }[] } {
  const orders = loadOperationalOrders();
  const map = new Map<string, number>();
  let totalOrders = 0;
  for (const o of orders) {
    totalOrders += 1;
    for (const line of o.items) {
      map.set(line.name, (map.get(line.name) ?? 0) + line.quantity);
    }
  }
  const byProduct = [...map.entries()]
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);
  return { totalOrders, byProduct };
}
