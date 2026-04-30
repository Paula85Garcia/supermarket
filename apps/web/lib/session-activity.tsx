"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { clearAuthSession } from "./auth";

/** Sesión JWT: inactividad prolongada (8 h) antes de cerrar. */
const IDLE_MS_JWT = 8 * 60 * 60 * 1000;
const REFRESH_MS = 12 * 60 * 1000;
const STORAGE_KEY = "mkx_last_activity_at";
const MOUSE_THROTTLE_MS = 20_000;

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : "";
}

/** JWT cookies son httpOnly: no aparecen en document.cookie; mkx_role sí (logout la borra). */
function hasAnySession(): boolean {
  return Boolean(readCookie("mkx_token") || readCookie("mkx_role"));
}

/** Sesión operativa (picker/driver): solo mkx_token en cliente, sin refresh JWT en el flujo típico. */
function isOperativeOnlySession(): boolean {
  return Boolean(readCookie("mkx_token"));
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
 * JWT: renueva access token con actividad reciente; cierra tras inactividad larga.
 * Operativo (solo mkx_token): no aplica cierre por inactividad ni refresh.
 */
export function SessionActivityManager() {
  const pathname = usePathname();
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMouseTouch = useRef(0);

  useEffect(() => {
    if (pathname === "/login" || pathname === "/register") return;

    if (!hasAnySession()) return;

    touchActivity();

    const onActivity = () => {
      touchActivity();
    };

    const onMouseMove = () => {
      const now = Date.now();
      if (now - lastMouseTouch.current < MOUSE_THROTTLE_MS) return;
      lastMouseTouch.current = now;
      touchActivity();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") touchActivity();
    };

    const opts = { passive: true } as AddEventListenerOptions;
    const onFocus = () => touchActivity();
    window.addEventListener("pointerdown", onActivity, opts);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("scroll", onActivity, opts);
    window.addEventListener("mousemove", onMouseMove, opts);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    const operativeOnly = isOperativeOnlySession();

    const runIdleCheck = () => {
      if (operativeOnly) return;
      if (!readCookie("mkx_role")) return;
      if (!hasAnySession()) return;
      const idleFor = Date.now() - lastActivityAt();
      if (idleFor < IDLE_MS_JWT) return;
      void (async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        clearAuthSession();
        window.location.assign("/login?reason=idle_timeout");
      })();
    };

    const runRefresh = () => {
      if (operativeOnly) return;
      if (!readCookie("mkx_role")) return;
      const idleFor = Date.now() - lastActivityAt();
      if (idleFor > IDLE_MS_JWT) return;
      if (idleFor > 12 * 60 * 1000) return;
      void fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    };

    if (!operativeOnly) {
      idleTimer.current = setInterval(runIdleCheck, 120_000);
      refreshTimer.current = setInterval(runRefresh, REFRESH_MS);
    }

    return () => {
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      if (idleTimer.current) clearInterval(idleTimer.current);
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [pathname]);

  return null;
}
