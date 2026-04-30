"use client";

const CHANNEL = "merkamax_picker_cart";

export type PickerCartSummaryMessage = { type: "cart_summary"; text: string; at: number };

/** Envía a otras pestañas (p. ej. panel de alistador) un resumen de carrito / intención de pedido. */
export function broadcastPickerCartSummary(text: string): void {
  if (typeof BroadcastChannel === "undefined") return;
  const ch = new BroadcastChannel(CHANNEL);
  const msg: PickerCartSummaryMessage = { type: "cart_summary", text, at: Date.now() };
  ch.postMessage(msg);
  ch.close();
}

export function subscribePickerCartSummary(handler: (msg: PickerCartSummaryMessage) => void): () => void {
  if (typeof BroadcastChannel === "undefined") return () => {};
  const ch = new BroadcastChannel(CHANNEL);
  ch.onmessage = (ev: MessageEvent<PickerCartSummaryMessage>) => {
    if (ev.data?.type === "cart_summary" && typeof ev.data.text === "string") handler(ev.data);
  };
  return () => ch.close();
}
