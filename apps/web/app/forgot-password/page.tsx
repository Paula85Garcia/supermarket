"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { safeJson } from "../../lib/safe-json";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const result =
        (await safeJson<{ data?: { ok?: boolean; message?: string; resetToken?: string } }>(response)) ?? null;
      if (!response.ok) {
        setError("No se pudo enviar la solicitud. Intenta de nuevo.");
        return;
      }
      const token = result?.data?.resetToken;
      if (typeof token === "string" && token.length > 0) {
        router.push(`/reset-password?token=${encodeURIComponent(token)}`);
        return;
      }
      setMessage(
        result?.data?.message ??
          "Si el correo está registrado, recibirás instrucciones para restablecer la contraseña (revisa tu bandeja cuando el envío de correos esté activo)."
      );
    } catch {
      setError("Sin conexión. Comprueba tu red.");
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
          Volver al inicio de sesión
        </Link>
      </div>
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-merka-border bg-merka-surface p-6">
        <h1 className="font-headline text-2xl font-semibold text-white">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Indica el correo de tu cuenta. En entornos de desarrollo con el servicio de auth activo, si el usuario existe
          podrás continuar al enlace de restablecimiento en esta misma sesión.
        </p>
        <input
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          type="email"
          required
          className="mt-4 w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
          placeholder="Correo"
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full rounded-xl bg-merka-yellow px-4 py-2.5 font-semibold text-merka-black transition hover:brightness-110 disabled:opacity-60"
        >
          {isLoading ? "Enviando…" : "Continuar"}
        </button>
        {message ? <p className="mt-3 text-center text-xs text-zinc-300">{message}</p> : null}
        {error ? <p className="mt-3 text-center text-xs text-merka-red">{error}</p> : null}
      </form>
    </main>
  );
}
