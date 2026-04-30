"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipboardList, LogOut, ShoppingCart, Truck, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { fetchWithAutoRefresh } from "../lib/fetch-with-auth";
import { useCart } from "../lib/cart-context";
import { loadOperationalOrders, subscribeOperationalOrders } from "../lib/orders-operational";
import { scanAndNotifyDelayedOrders } from "../lib/app-notifications";
import { getProfile } from "../lib/workforce";
import { FreeShippingProgress } from "./free-shipping-progress";
import { HeaderSearch } from "./header-search";
import { NotificationBell } from "./notification-bell";

const hoverBtn = "rounded-xl border border-merka-border bg-merka-surface p-2.5 text-zinc-300 transition hover:border-merka-yellow hover:bg-merka-yellow/10 hover:text-merka-yellow";
const hoverLink = "rounded-xl border border-merka-border bg-merka-surface px-3 py-2 text-xs text-zinc-300 transition hover:border-merka-yellow hover:bg-merka-yellow/10 hover:text-merka-yellow";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, subtotal, cartBumpKey } = useCart();
  const [sessionStatus, setSessionStatus] = useState<"checking" | "connected" | "guest">("checking");
  const [role, setRole] = useState<string>("");
  const [readyForDriver, setReadyForDriver] = useState(0);
  const [operativeTurnLine, setOperativeTurnLine] = useState<string | null>(null);

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

  useEffect(() => {
    const run = () => scanAndNotifyDelayedOrders(loadOperationalOrders());
    run();
    const t = window.setInterval(run, 60_000);
    const unsub = subscribeOperationalOrders(run);
    return () => {
      window.clearInterval(t);
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!isDriver && !isPicker) {
      setOperativeTurnLine(null);
      return;
    }
    const id = readCookie("mkx_identifier");
    if (!id) {
      setOperativeTurnLine(null);
      return;
    }
    const profile = getProfile(id);
    const parts = [profile?.displayName?.trim(), profile?.shift?.trim()].filter(Boolean);
    setOperativeTurnLine(parts.length ? parts.join(" · ") : id);
  }, [isDriver, isPicker, pathname, sessionStatus]);

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const showSearch = !isDriver && !isPicker && pathname !== "/admin";
  const showFreeShipping = showSearch && role !== "admin";

  return (
    <header className="flex flex-col gap-3 md:gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {showSearch ? (
          <div className="flex w-full flex-col gap-2 md:max-w-2xl">
            <Suspense
              fallback={
                <div className="h-[52px] w-full animate-pulse rounded-2xl border border-merka-border bg-merka-surface md:max-w-2xl" />
              }
            >
              <HeaderSearch />
            </Suspense>
            {showFreeShipping ? <FreeShippingProgress variant="compact" /> : null}
          </div>
        ) : (
          <div className="flex min-h-[52px] flex-1 items-center gap-3 rounded-2xl border border-merka-border bg-merka-surface/50 px-4 py-3 md:max-w-xl">
            {isDriver ? (
              <Truck className="h-5 w-5 shrink-0 text-merka-yellow" strokeWidth={1.75} aria-hidden />
            ) : (
              <ClipboardList className="h-5 w-5 shrink-0 text-merka-green" strokeWidth={1.75} aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-merka-yellow">
                {isDriver ? "Domiciliario en turno" : "Alistamiento"}
              </p>
              <p className="truncate text-sm text-zinc-200">
                {operativeTurnLine ?? (isDriver ? "Inicia sesión operativa con nombre y horario." : "Pedidos y checklist")}
              </p>
            </div>
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
          <NotificationBell extraBadgeCount={isDriver && readyForDriver > 0 ? readyForDriver : 0} />
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
              <div className="relative rounded-xl bg-merka-red p-2.5 text-white ring-merka-yellow transition group-hover:scale-[1.04] group-hover:ring-2">
                {cartBumpKey > 0 ? (
                  <motion.span
                    key={cartBumpKey}
                    className="inline-flex"
                    initial={{ scale: 1, rotate: 0 }}
                    animate={{ scale: [1, 1.22, 1], rotate: [0, -12, 12, 0] }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    <ShoppingCart size={18} />
                  </motion.span>
                ) : (
                  <span className="inline-flex">
                    <ShoppingCart size={18} />
                  </span>
                )}
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-merka-red px-1 text-[10px] font-bold ring-1 ring-white/20">
                  {totalItems}
                </span>
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
