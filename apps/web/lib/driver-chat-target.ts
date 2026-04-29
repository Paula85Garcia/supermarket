"use client";

let customerPhone: string | null = null;
const listeners = new Set<() => void>();

export function setDriverChatCustomerPhone(phone: string | null): void {
  customerPhone = phone;
  listeners.forEach((fn) => fn());
}

export function getDriverChatCustomerPhone(): string | null {
  return customerPhone;
}

export function subscribeDriverChatCustomerPhone(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
