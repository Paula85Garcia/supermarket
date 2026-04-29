"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getDriverChatCustomerPhone, subscribeDriverChatCustomerPhone } from "../lib/driver-chat-target";

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [driverPhone, setDriverPhone] = useState<string | null>(null);

  useEffect(() => {
    setDriverPhone(getDriverChatCustomerPhone());
    return subscribeDriverChatCustomerPhone(() => {
      setDriverPhone(getDriverChatCustomerPhone());
    });
  }, []);

  const onSend = () => {
    const text = message.trim() || "Hola, te escribo desde MERKAMAX sobre tu pedido.";
    const target = driverPhone ? driverPhone.replace(/\D/g, "") : "573053700491";
    const whatsappUrl = `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setMessage("");
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className="mb-3 w-[300px] rounded-2xl border border-merka-border bg-merka-surface p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-headline text-sm font-semibold text-white">{driverPhone ? "Chat con cliente" : "Max IA"}</p>
              <button type="button" onClick={() => setOpen(false)} className="text-zinc-400 transition hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="mb-3 rounded-xl border border-merka-border bg-merka-black p-3 text-sm text-zinc-300">
              {driverPhone ? (
                <>
                  Contacto directo por WhatsApp al cliente seleccionado: <span className="text-merka-yellow">{driverPhone}</span>. Tambien puedes
                  coordinar entrega aqui.
                </>
              ) : (
                <>Hola, soy Max. Puedo ayudarte con productos, pedidos y entregas.</>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-merka-border bg-merka-black px-3 py-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSend();
                  }
                }}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                placeholder={driverPhone ? "Mensaje al cliente..." : "Escribe tu mensaje..."}
              />
              <button type="button" onClick={onSend} className="text-merka-yellow transition hover:scale-110" aria-label="Enviar por WhatsApp">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-merka-yellow text-merka-black shadow-lg transition hover:ring-2 hover:ring-white/30"
        title="Abrir chat"
      >
        <MessageCircle size={20} />
      </button>
    </div>
  );
}
