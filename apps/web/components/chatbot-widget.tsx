"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getDriverChatCustomerPhone, subscribeDriverChatCustomerPhone } from "../lib/driver-chat-target";
import { buildCartWaText, getPickerWhatsappDigits, openWhatsAppToDigits } from "../lib/picker-whatsapp";
import { useCart } from "../lib/cart-context";

type CustomerChannel = "whatsapp" | "max";

function maxReply(userText: string): string {
  const t = userText.toLowerCase();
  if (t.includes("pedido") || t.includes("orden")) {
    return "Puedes confirmar tu pedido en checkout o enviar el resumen por WhatsApp al equipo de alistamiento desde la pestaña correspondiente.";
  }
  if (t.includes("hora") || t.includes("cuándo") || t.includes("cuando")) {
    return "Los tiempos dependen del alistamiento y la ruta. Cuando tengas número de pedido, revisa el seguimiento en la app.";
  }
  if (t.includes("precio") || t.includes("cuesta") || t.includes("vale")) {
    return "Los precios que ves en el catálogo son los vigentes. Si algo no cuadra, escríbenos por WhatsApp al alistamiento.";
  }
  if (t.includes("hola") || t.includes("buenos")) {
    return "Hola, soy Max (asistente de demostración). ¿En qué te ayudo con MERKAMAX?";
  }
  return "Gracias por tu mensaje. Para temas concretos del pedido o inventario, WhatsApp al alistamiento suele ser más rápido. ¿Quieres que te indique cómo enviar el resumen del carrito?";
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [driverPhone, setDriverPhone] = useState<string | null>(null);
  const [customerChannel, setCustomerChannel] = useState<CustomerChannel>("whatsapp");
  const [maxThread, setMaxThread] = useState<{ role: "user" | "max"; text: string }[]>([]);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const { items, subtotal } = useCart();

  useEffect(() => {
    setDriverPhone(getDriverChatCustomerPhone());
    return subscribeDriverChatCustomerPhone(() => {
      setDriverPhone(getDriverChatCustomerPhone());
    });
  }, []);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [maxThread, open, customerChannel]);

  const sendWhatsApp = (text: string) => {
    const target = driverPhone ? driverPhone.replace(/\D/g, "") : getPickerWhatsappDigits();
    openWhatsAppToDigits(target, text);
    setMessage("");
  };

  const onSendDriver = () => {
    const text = message.trim() || "Hola, te escribo desde MERKAMAX sobre tu pedido.";
    sendWhatsApp(text);
  };

  const onSendCustomerWa = () => {
    const deliveryFee = subtotal < 20000 && subtotal > 0 ? 2000 : 0;
    const total = subtotal + deliveryFee;
    const lines = items.map((item) => `- ${item.name} x${item.quantity} ($${(item.priceCOP * item.quantity).toLocaleString("es-CO")})`);
    const text =
      message.trim() ||
      (items.length
        ? buildCartWaText({ lines, subtotal, deliveryFee, total })
        : "Hola, equipo de alistamiento MERKAMAX. Tengo una consulta sobre mi pedido.");
    sendWhatsApp(text);
  };

  const onSendMax = () => {
    const text = message.trim();
    if (!text) return;
    setMaxThread((prev) => [...prev, { role: "user", text }]);
    setMessage("");
    window.setTimeout(() => {
      setMaxThread((prev) => [...prev, { role: "max", text: maxReply(text) }]);
    }, 450);
  };

  const isDriverContext = Boolean(driverPhone);

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className="mb-3 w-[min(100vw-2rem,320px)] rounded-2xl border border-merka-border bg-merka-surface p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-headline text-sm font-semibold text-white">
                {isDriverContext ? "WhatsApp cliente" : "Ayuda MERKAMAX"}
              </p>
              <button type="button" onClick={() => setOpen(false)} className="text-zinc-400 transition hover:text-white">
                <X size={16} />
              </button>
            </div>

            {isDriverContext ? (
              <>
                <div className="mb-3 rounded-xl border border-merka-border bg-merka-black p-3 text-xs text-zinc-300">
                  Envío por WhatsApp al número del cliente: <span className="text-merka-yellow">{driverPhone}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-merka-border bg-merka-black px-3 py-2">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        onSendDriver();
                      }
                    }}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                    placeholder="Mensaje al cliente…"
                  />
                  <button type="button" onClick={onSendDriver} className="text-merka-yellow transition hover:scale-110" aria-label="Enviar por WhatsApp">
                    <Send size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2 flex rounded-xl border border-merka-border bg-merka-black p-0.5 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setCustomerChannel("whatsapp")}
                    className={`flex-1 rounded-lg px-2 py-2 transition ${
                      customerChannel === "whatsapp" ? "bg-merka-yellow text-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    WhatsApp alistamiento
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerChannel("max")}
                    className={`flex-1 rounded-lg px-2 py-2 transition ${
                      customerChannel === "max" ? "bg-merka-green text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Max (chat aquí)
                  </button>
                </div>

                {customerChannel === "whatsapp" ? (
                  <div className="mb-3 rounded-xl border border-merka-border bg-merka-black p-3 text-xs leading-relaxed text-zinc-300">
                    Se abre WhatsApp hacia el <span className="text-merka-yellow">alistamiento</span> (teléfono del turno o el de la tienda). Si
                    tienes productos en el carrito, puedes enviar el resumen con un toque.
                  </div>
                ) : (
                  <div className="mb-2 max-h-40 overflow-y-auto rounded-xl border border-merka-border bg-merka-black p-2 text-xs">
                    {maxThread.length === 0 ? (
                      <p className="p-2 text-zinc-500">Escribe abajo. Max responde aquí (demo, sin servidor de IA).</p>
                    ) : (
                      maxThread.map((m, i) => (
                        <p
                          key={`${i}-${m.role}`}
                          className={`mb-2 rounded-lg px-2 py-1.5 ${m.role === "user" ? "ml-4 bg-zinc-800 text-zinc-100" : "mr-4 bg-merka-green/20 text-zinc-200"}`}
                        >
                          <span className="font-semibold text-merka-yellow">{m.role === "user" ? "Tú" : "Max"}:</span> {m.text}
                        </p>
                      ))
                    )}
                    <div ref={threadEndRef} />
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-xl border border-merka-border bg-merka-black px-3 py-2">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        customerChannel === "whatsapp" ? onSendCustomerWa() : onSendMax();
                      }
                    }}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                    placeholder={customerChannel === "whatsapp" ? "Mensaje o deja vacío para resumen del carrito…" : "Escribe a Max…"}
                  />
                  <button
                    type="button"
                    onClick={customerChannel === "whatsapp" ? onSendCustomerWa : onSendMax}
                    className={customerChannel === "whatsapp" ? "text-merka-yellow transition hover:scale-110" : "text-merka-green transition hover:scale-110"}
                    aria-label={customerChannel === "whatsapp" ? "Enviar por WhatsApp" : "Enviar a Max"}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-merka-yellow text-merka-black shadow-lg transition hover:ring-2 hover:ring-white/30"
        title="Ayuda y contacto"
      >
        <MessageCircle size={20} />
      </button>
    </div>
  );
}
