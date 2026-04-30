"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { clearAuthSession } from "./auth";

const IDLE_MS = 60 * 60 * 1000;
const REFRESH_MS = 10 * 60 * 1000;
const STORAGE_KEY = "mkx_last_activity_at";

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : "";
}

function hasAnySession(): boolean {
  return Boolean(readCookie("mkx_refresh_token") || readCookie("mkx_token"));
}

function touchActivity(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

function lastActivityAt(): number {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw != null && raw !== "") {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {
    /* ignore */
  }
  return Date.now();
}

/**
 * Renueva el access token mientras haya actividad (sesión JWT).
 * Cierra sesión tras 1 h sin interacción (JWT u operativo).
 */
export function SessionActivityManager() {
  const pathname = usePathname();
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (pathname === "/login" || pathname === "/register") return;

    if (!hasAnySession()) return;

    touchActivity();

    const onActivity = () => {
      touchActivity();
    };

    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener("pointerdown", onActivity, opts);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("scroll", onActivity, opts);

    const runIdleCheck = () => {
      if (!hasAnySession()) return;
      const idleFor = Date.now() - lastActivityAt();
      if (idleFor < IDLE_MS) return;
      void (async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        clearAuthSession();
        window.location.assign("/login?reason=idle_timeout");
      })();
    };

    const runRefresh = () => {
      if (!readCookie("mkx_refresh_token")) return;
      const idleFor = Date.now() - lastActivityAt();
      if (idleFor > IDLE_MS) return;
      if (idleFor > 5 * 60 * 1000) return;
      void fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    };

    idleTimer.current = setInterval(runIdleCheck, 60_000);
    refreshTimer.current = setInterval(runRefresh, REFRESH_MS);

    return () => {
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("scroll", onActivity);
      if (idleTimer.current) clearInterval(idleTimer.current);
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [pathname]);

  return null;
}
