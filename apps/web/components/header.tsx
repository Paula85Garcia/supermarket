"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, LogOut, Search, ShoppingCart, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { fetchWithAutoRefresh } from "../lib/fetch-with-auth";
import { useCart } from "../lib/cart-context";

export function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [sessionStatus, setSessionStatus] = useState<"checking" | "connected" | "guest">("checking");
  const [role, setRole] = useState<string>("");

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

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex w-full items-center gap-3 rounded-2xl border border-merka-border bg-merka-surface px-4 py-3 md:max-w-2xl">
        <Search className="text-zinc-400" size={18} />
        <input
          type="text"
          placeholder="Preguntale a Max o busca un producto..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
        />
        <span className="rounded-full bg-merka-yellow px-3 py-1 text-xs font-semibold text-merka-black">IA</span>
      </div>
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
        <Link href="/about" className="rounded-xl border border-merka-border bg-merka-surface px-3 py-2 text-xs text-zinc-300">
          Sobre nosotros
        </Link>
        <button className="rounded-xl border border-merka-border bg-merka-surface p-2.5 text-zinc-300">
          <Bell size={18} />
        </button>
        <Link href="/login" className="rounded-xl border border-merka-border bg-merka-surface p-2.5 text-zinc-300">
          <UserCircle2 size={18} />
        </Link>
        <button
          onClick={onLogout}
          className="rounded-xl border border-merka-border bg-merka-surface p-2.5 text-zinc-300 transition hover:bg-merka-red hover:text-white"
          aria-label="Cerrar sesion"
        >
          <LogOut size={18} />
        </button>
        {role !== "driver" && role !== "picker" ? (
          <Link href="/cart">
            <motion.div whileHover={{ scale: 1.06 }} className="relative rounded-xl bg-merka-red p-2.5 text-white">
              <ShoppingCart size={18} />
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-merka-red px-1 text-[10px] font-bold">
                {totalItems}
              </span>
            </motion.div>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
