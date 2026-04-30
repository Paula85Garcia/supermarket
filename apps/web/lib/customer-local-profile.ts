"use client";

const STORAGE_KEY = "mkx_customer_local_profile";

export interface CustomerLocalProfile {
  fullName: string;
  email: string;
  whatsappPhone: string;
  /** Dirección principal / facturación */
  homeAddress: string;
  /** Dirección alternativa para entregas (opcional) */
  altDeliveryAddress?: string;
  updatedAt?: string;
}

export function loadCustomerLocalProfile(): CustomerLocalProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CustomerLocalProfile;
  } catch {
    return null;
  }
}

export function saveCustomerLocalProfile(profile: CustomerLocalProfile): void {
  if (typeof window === "undefined") return;
  const next: CustomerLocalProfile = {
    ...profile,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearCustomerLocalProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
