"use client";

import { getProfile, loadWorkforceUsers } from "./workforce";

/** Solo dígitos, con prefijo país (ej. 57300…). */
export function normalizeCoPhone(input: string): string {
  const d = input.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("57") && d.length >= 12) return d;
  if (d.length === 10) return `57${d}`;
  if (d.length >= 10 && d.length <= 13) return d;
  return d;
}

/**
 * Número WhatsApp del alistamiento: perfil de pickers activos, luego env público, luego respaldo.
 */
export function getPickerWhatsappDigits(): string {
  const envDigits =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_MERKAMAX_PICKER_WA
      ? normalizeCoPhone(process.env.NEXT_PUBLIC_MERKAMAX_PICKER_WA)
      : "";

  if (typeof window === "undefined") {
    return envDigits || "573053700491";
  }

  const pickers = loadWorkforceUsers().filter((u) => u.active && u.role === "picker");
  for (const u of pickers) {
    const raw = getProfile(u.username)?.whatsappPhone?.trim();
    if (raw) {
      const n = normalizeCoPhone(raw);
      if (n.length >= 11) return n;
    }
  }

  return envDigits || "573053700491";
}

export function buildCartWaText(params: {
  lines: string[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}): string {
  const body = [
    "Hola, equipo de alistamiento MERKAMAX.",
    "",
    "Resumen del pedido (carrito):",
    ...params.lines,
    "",
    `Subtotal: $${params.subtotal.toLocaleString("es-CO")}`,
    `Recargo domicilio: $${params.deliveryFee.toLocaleString("es-CO")}`,
    `Total: $${params.total.toLocaleString("es-CO")}`,
    "",
    "¿Me confirman disponibilidad y ventana de entrega? Gracias."
  ].join("\n");
  return body;
}

export function openWhatsAppToDigits(digits: string, text: string): void {
  const target = digits.replace(/\D/g, "");
  if (!target) return;
  const url = `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
