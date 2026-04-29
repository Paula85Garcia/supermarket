"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { safeJson } from "../../lib/safe-json";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!whatsappPhone.trim()) {
      setError("El numero de WhatsApp es obligatorio");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }
    setIsLoading(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        whatsappPhone,
        password,
        storeId: "main-store"
      })
    });
    const result = (await safeJson<{ error?: { message?: string } }>(response)) ?? null;
    setIsLoading(false);

    if (!response.ok) {
      setError(result?.error?.message ?? "No se pudo registrar");
      return;
    }
    router.push("/login?registered=1");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-merka-black px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-merka-border bg-merka-surface p-6">
        <h1 className="font-headline text-2xl font-semibold text-white">Crear cuenta</h1>
        <div className="mt-5 space-y-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Nombre completo"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Correo"
          />
          <input
            value={whatsappPhone}
            onChange={(e) => setWhatsappPhone(e.target.value)}
            className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Numero de WhatsApp (ej. +57 3001234567)"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Contrasena"
          />
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Confirmar contrasena"
          />
          <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 accent-[#FFD700]"
            />
            Mostrar contrasena
          </label>
        </div>
        {error ? <p className="mt-3 text-xs text-merka-red">{error}</p> : null}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 w-full rounded-xl bg-merka-green px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? "Creando cuenta..." : "Registrarme"}
        </button>
        <Link
          href="/login"
          className="mt-2 inline-flex w-full justify-center rounded-xl border border-merka-border bg-merka-surface px-4 py-2 text-sm font-semibold text-zinc-200"
        >
          Volver a inicio de sesion
        </Link>
        <p className="mt-3 text-center text-xs text-zinc-400">
          Ya tienes cuenta? <Link className="text-merka-yellow" href="/login">Inicia sesion</Link>
        </p>
      </form>
    </main>
  );
}
