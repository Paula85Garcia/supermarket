"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Home } from "lucide-react";
import { safeJson } from "../../lib/safe-json";

function alertError(message: string): void {
  window.alert(message);
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!acceptTerms) {
      alertError("Marca la casilla para confirmar que aceptas los Términos y Condiciones y la Política de Privacidad.");
      return;
    }
    if (!whatsappPhone.trim()) {
      alertError("El número de WhatsApp es obligatorio.");
      return;
    }
    if (password !== confirmPassword) {
      alertError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
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

      if (!response.ok) {
        alertError(result?.error?.message ?? "No se pudo completar el registro. Intenta de nuevo.");
        return;
      }
      router.push("/?registered=1");
    } catch {
      alertError("No hubo conexión con el servidor. Comprueba tu red e intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-merka-black px-4 py-8">
      <div className="mb-4 flex w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-merka-border bg-merka-surface px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-merka-yellow hover:text-merka-yellow"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          <Home className="h-4 w-4 shrink-0 text-merka-yellow" aria-hidden />
          Volver al inicio
        </Link>
      </div>
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-merka-border bg-merka-surface p-6">
        <h1 className="font-headline text-2xl font-semibold text-white">Crear cuenta</h1>
        <p className="mt-1 text-sm text-zinc-400">Completa tus datos. Puedes mostrar u ocultar la contraseña con el ícono del ojo.</p>
        <p className="mt-3 text-xs leading-relaxed text-zinc-300">
          Al <span className="font-semibold text-white">registrarme</span>, acepto los{" "}
          <Link href="/terms#terminos" className="text-merka-yellow underline-offset-2 hover:underline">
            Términos y Condiciones
          </Link>{" "}
          y autorizo el tratamiento de mis datos personales conforme a la{" "}
          <Link href="/terms#privacidad" className="text-merka-green underline-offset-2 hover:underline">
            Política de Privacidad
          </Link>
          .
        </p>
        <div className="mt-5 space-y-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Nombre completo"
            autoComplete="name"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Correo"
            autoComplete="email"
          />
          <input
            value={whatsappPhone}
            onChange={(e) => setWhatsappPhone(e.target.value)}
            className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="WhatsApp (ej. +57 3001234567)"
            autoComplete="tel"
          />
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl border border-merka-border bg-merka-black py-2 pl-3 pr-11 text-sm text-white outline-none"
              placeholder="Contraseña"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition hover:bg-merka-yellow/10 hover:text-merka-yellow"
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative">
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl border border-merka-border bg-merka-black py-2 pl-3 pr-11 text-sm text-white outline-none"
              placeholder="Confirmar contraseña"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition hover:bg-merka-yellow/10 hover:text-merka-yellow"
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-merka-border bg-merka-black/60 px-3 py-3 text-xs leading-relaxed text-zinc-300">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#FFD700]"
            />
            <span>
              Confirmo lo anterior: acepto los{" "}
              <Link href="/terms#terminos" className="font-semibold text-merka-yellow underline-offset-2 hover:underline">
                Términos y Condiciones
              </Link>{" "}
              y autorizo el tratamiento de mis datos según la{" "}
              <Link href="/terms#privacidad" className="font-semibold text-merka-green underline-offset-2 hover:underline">
                Política de Privacidad
              </Link>
              .
            </span>
          </label>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 w-full rounded-xl bg-merka-yellow px-4 py-2.5 font-semibold text-merka-black transition hover:brightness-110 disabled:opacity-60"
        >
          {isLoading ? "Creando cuenta…" : "Registrarme"}
        </button>
        <Link
          href="/login"
          className="mt-2 inline-flex w-full justify-center rounded-xl border border-merka-border bg-merka-surface px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-merka-yellow hover:text-merka-yellow"
        >
          Volver a inicio de sesión
        </Link>
        <p className="mt-3 text-center text-xs text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link className="text-merka-yellow underline-offset-2 hover:underline" href="/login">
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
