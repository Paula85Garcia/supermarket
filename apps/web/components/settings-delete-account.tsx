"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCustomerLocalProfile } from "../lib/customer-local-profile";
import { safeJson } from "../lib/safe-json";

type Props = {
  /** Solo mostrar si la sesión es de comprador (rol en cookie legible). */
  show: boolean;
};

export function SettingsDeleteAccount({ show }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (confirmText.trim().toUpperCase() !== "ELIMINAR") {
      setError('Escribe la palabra ELIMINAR para confirmar.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password })
      });
      const result = (await safeJson<{ error?: { message?: string } }>(response)) ?? null;
      if (!response.ok) {
        setError(result?.error?.message ?? "No se pudo eliminar la cuenta.");
        return;
      }
      clearCustomerLocalProfile();
      router.replace("/?account_deleted=1");
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-lg border-t border-merka-border pt-8 text-left">
      <h3 className="font-headline text-lg font-semibold text-merka-red">Eliminar cuenta</h3>
      <p className="mt-2 text-sm text-zinc-400">
        Solo disponible para cuentas de comprador. Se borran tus datos de acceso en el servidor; los datos guardados solo
        en este navegador también se quitan al confirmar.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          type="password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
          placeholder="Contraseña actual"
          autoComplete="current-password"
          minLength={8}
          required
        />
        <input
          value={confirmText}
          onChange={(ev) => setConfirmText(ev.target.value)}
          className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
          placeholder="Escribe ELIMINAR para confirmar"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl border border-merka-red/60 bg-merka-red/15 px-4 py-2.5 text-sm font-semibold text-merka-red transition hover:bg-merka-red/25 disabled:opacity-60"
        >
          {busy ? "Eliminando…" : "Eliminar mi cuenta de comprador"}
        </button>
        {error ? <p className="text-xs text-merka-red">{error}</p> : null}
      </form>
    </div>
  );
}
