"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, LogOut, Search, ShoppingCart, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { fetchWithAutoRefresh } from "../lib/fetch-with-auth";
import { useCart } from "../lib/cart-context";
import { loadOperationalOrders, subscribeOperationalOrders } from "../lib/orders-operational";

const hoverBtn = "rounded-xl border border-merka-border bg-merka-surface p-2.5 text-zinc-300 transition hover:border-merka-yellow hover:bg-merka-yellow/10 hover:text-merka-yellow";
const hoverLink = "rounded-xl border border-merka-border bg-merka-surface px-3 py-2 text-xs text-zinc-300 transition hover:border-merka-yellow hover:bg-merka-yellow/10 hover:text-merka-yellow";
const hoverSearch = "flex w-full items-center gap-3 rounded-2xl border border-merka-border bg-merka-surface px-4 py-3 transition hover:border-merka-yellow/60 hover:shadow-[0_0_0_1px_rgba(234,179,8,0.15)] md:max-w-2xl";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [sessionStatus, setSessionStatus] = useState<"checking" | "connected" | "guest">("checking");
  const [role, setRole] = useState<string>("");
  const [readyForDriver, setReadyForDriver] = useState(0);

  const isDriver = role === "driver";
  const isPicker = role === "picker";

  const readCookie = (name: string): string => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : "";
  };

  useEffect(() => {
    const loadSession = async () => {
      const roleFromCookie = readCookie("mkx_role");
      setRole(roleFromCookie);
      if (roleFromCookie) {
        setSessionStatus("connected");
        return;
      }
      const response = await fetchWithAutoRefresh("/api/auth/me?optional=1", { method: "GET" });
      if (response.ok) {
        const result = (await response.json()) as { data?: { authenticated?: boolean } };
        setSessionStatus(result.data?.authenticated === false ? "guest" : "connected");
        return;
      }
      setSessionStatus("guest");
    };
    void loadSession();
  }, []);

  useEffect(() => {
    if (!isDriver) return;
    const tick = () => setReadyForDriver(loadOperationalOrders().filter((o) => o.status === "ready").length);
    tick();
    return subscribeOperationalOrders(tick);
  }, [isDriver]);

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const showSearch = !isDriver && !isPicker && pathname !== "/admin";

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {showSearch ? (
        <div className={hoverSearch}>
          <Search className="shrink-0 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Preguntale a Max o busca un producto..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />
          <span className="shrink-0 rounded-full bg-merka-yellow px-3 py-1 text-xs font-semibold text-merka-black">IA</span>
        </div>
      ) : (
        <div className="flex min-h-[48px] flex-1 items-center rounded-2xl border border-merka-border bg-merka-surface/50 px-4 py-2 text-sm text-zinc-500 md:max-w-xl">
          {isDriver ? "Vista domiciliario: sin buscador ni IA en barra principal." : "Vista alistamiento: enfoque en pedidos."}
        </div>
      )}
      <div className="flex items-center justify-end gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${
            sessionStatus === "connected"
              ? "border-merka-green/60 bg-merka-green/10 text-merka-green"
              : sessionStatus === "guest"
                ? "border-merka-yellow/40 bg-merka-yellow/10 text-merka-yellow"
                : "border-merka-border bg-merka-surface text-zinc-400"
          }`}
        >
          {sessionStatus === "connected" ? "CONECTADO" : sessionStatus === "guest" ? "INVITADO" : "VALIDANDO"}
        </span>
        <Link href="/about" className={hoverLink}>
          Sobre nosotros
        </Link>
        <button type="button" className={`relative ${hoverBtn}`} aria-label="Notificaciones">
          <Bell size={18} />
          {isDriver && readyForDriver > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-merka-red px-1 text-[9px] font-bold text-white">
              {readyForDriver > 9 ? "9+" : readyForDriver}
            </span>
          ) : null}
        </button>
        <Link href="/login" className={hoverBtn} title="Iniciar sesion">
          <UserCircle2 size={18} />
        </Link>
        <button
          onClick={onLogout}
          className={`${hoverBtn} hover:!border-merka-red hover:!bg-merka-red/20 hover:!text-white`}
          aria-label="Cerrar sesion"
          title="Salir"
        >
          <LogOut size={18} />
        </button>
        {role !== "driver" && role !== "picker" ? (
          <Link href="/cart" className="group relative">
            <motion.div whileHover={{ scale: 1.06 }} className="relative rounded-xl bg-merka-red p-2.5 text-white ring-merka-yellow transition group-hover:ring-2">
              <ShoppingCart size={18} />
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-merka-red px-1 text-[10px] font-bold ring-1 ring-white/20">
                {totalItems}
              </span>
            </motion.div>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
