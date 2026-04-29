"use client";

export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia" | "pendiente";

export interface OperationalLineItem {
  productId: string;
  name: string;
  description: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
}

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
    pickerConfirmedDriverPayment: settledOnline
  };
  saveOperationalOrders([full, ...prev]);
}

export function updateOperationalOrder(id: string, patch: Partial<OperationalOrder>): void {
  const prev = loadOperationalOrders();
  saveOperationalOrders(prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
}

export function getOperationalOrder(id: string): OperationalOrder | undefined {
  return loadOperationalOrders().find((o) => o.id === id);
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
