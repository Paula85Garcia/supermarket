"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Home } from "lucide-react";
import { safeJson } from "../../lib/safe-json";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get("token");
    if (q) setToken(q);
  }, [searchParams]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!token.trim()) {
      setError("Falta el enlace o token. Solicita de nuevo la recuperación.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), newPassword: password })
      });
      const result = (await safeJson<{ error?: { message?: string } }>(response)) ?? null;
      if (!response.ok) {
        setError(result?.error?.message ?? "No se pudo actualizar la contraseña.");
        return;
      }
      router.push("/login?reason=password_reset_ok");
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-merka-black px-4 py-8">
      <div className="mb-4 flex w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl border border-merka-border bg-merka-surface px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-merka-yellow hover:text-merka-yellow"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          <Home className="h-4 w-4 shrink-0 text-merka-yellow" aria-hidden />
          Inicio de sesión
        </Link>
      </div>
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-merka-border bg-merka-surface p-6">
        <h1 className="font-headline text-2xl font-semibold text-white">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-zinc-400">El enlace caduca en aproximadamente una hora.</p>
        <label className="mt-4 block text-xs text-zinc-400">
          Token (por si abres el enlace manualmente)
          <input
            value={token}
            onChange={(ev) => setToken(ev.target.value)}
            className="mt-1 w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 font-mono text-xs text-white outline-none"
            autoComplete="off"
          />
        </label>
        <div className="relative mt-3">
          <input
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            type={show ? "text" : "password"}
            minLength={8}
            required
            className="w-full rounded-xl border border-merka-border bg-merka-black py-2 pl-3 pr-11 text-sm text-white outline-none"
            placeholder="Nueva contraseña (mín. 8)"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-merka-yellow/10 hover:text-merka-yellow"
            aria-label={show ? "Ocultar" : "Mostrar"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <input
          value={confirm}
          onChange={(ev) => setConfirm(ev.target.value)}
          type={show ? "text" : "password"}
          className="mt-3 w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
          placeholder="Confirmar contraseña"
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 w-full rounded-xl bg-merka-green px-4 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {isLoading ? "Guardando…" : "Guardar contraseña"}
        </button>
        {error ? <p className="mt-3 text-center text-xs text-merka-red">{error}</p> : null}
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-merka-black px-4">
          <p className="text-sm text-zinc-400">Cargando…</p>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
