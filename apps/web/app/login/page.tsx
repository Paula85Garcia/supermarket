"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Home } from "lucide-react";
import { safeJson } from "../../lib/safe-json";
import { setClientSession } from "../../lib/auth";
import { loadWorkforceUsers, saveProfile, type WorkforceUser } from "../../lib/workforce";

const AUTH_REASON_COPY: Record<string, { title: string; body: string; border: string }> = {
  session_expired: {
    title: "Sesión cerrada",
    body: "Tu sesión ya no es válida. Ingresa de nuevo para continuar.",
    border: "border-merka-red/50 bg-merka-red/10"
  },
  idle_timeout: {
    title: "Inactividad",
    body: "Por seguridad cerramos la sesión tras 1 hora sin uso. Puedes volver a entrar cuando quieras.",
    border: "border-merka-yellow/50 bg-merka-yellow/10"
  }
};

function alertError(message: string): void {
  window.alert(message);
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginMode, setLoginMode] = useState<"user" | "operative">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [shift, setShift] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workforceUsers, setWorkforceUsers] = useState<WorkforceUser[]>([]);

  const reasonKey = searchParams.get("reason") ?? "";
  const reasonBanner = reasonKey ? AUTH_REASON_COPY[reasonKey] : null;

  useEffect(() => {
    setWorkforceUsers(loadWorkforceUsers().filter((user) => user.active));
  }, []);

  const selectedWorkforce = useMemo(
    () => workforceUsers.find((user) => user.username.toLowerCase() === email.trim().toLowerCase()),
    [email, workforceUsers]
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loginMode === "operative") {
      if (!selectedWorkforce) {
        alertError("Selecciona un usuario operativo de la lista.");
        return;
      }
      if (selectedWorkforce.password !== password) {
        alertError("Usuario o contraseña incorrectos. Revisa e intenta de nuevo.");
        return;
      }
      if ((selectedWorkforce.role === "driver" || selectedWorkforce.role === "picker") && (!displayName.trim() || !shift.trim())) {
        alertError("Para este rol indica nombre visible y turno u horario (texto).");
        return;
      }
      if (selectedWorkforce.role === "driver" || selectedWorkforce.role === "picker") {
        saveProfile({ username: selectedWorkforce.username, displayName, shift: shift.trim() });
      }
      setClientSession(selectedWorkforce.role, selectedWorkforce.username);
      router.push(selectedWorkforce.role === "admin" ? "/admin" : selectedWorkforce.role === "driver" ? "/driver" : "/picker");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result =
        (await safeJson<{ data?: { role?: string }; error?: { message?: string } }>(response)) ?? null;

      if (!response.ok) {
        alertError(result?.error?.message ?? "No pudimos iniciar sesión. Revisa tus datos e intenta otra vez.");
        return;
      }

      router.push(result?.data?.role === "admin" ? "/admin" : "/");
    } catch {
      alertError("No hubo conexión con el servidor. Comprueba tu red e intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-merka-black px-4 py-8">
      <div className="mb-4 flex w-full max-w-md flex-wrap items-center justify-between gap-2">
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
        <h1 className="font-headline text-2xl font-semibold text-white">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-zinc-400">Accede para ver tus pedidos o administrar el catálogo.</p>
        {reasonBanner ? (
          <div className={`mt-4 rounded-xl border px-3 py-3 text-sm ${reasonBanner.border}`}>
            <p className="font-semibold text-white">{reasonBanner.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-300">{reasonBanner.body}</p>
          </div>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-merka-border bg-merka-black p-1">
          <button
            type="button"
            onClick={() => setLoginMode("user")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
              loginMode === "user" ? "bg-merka-yellow text-merka-black" : "text-zinc-300"
            }`}
          >
            Usuario
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("operative")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
              loginMode === "operative" ? "bg-merka-yellow text-merka-black" : "text-zinc-300"
            }`}
          >
            Operativo
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {loginMode === "operative" ? (
            <select
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Selecciona usuario operativo</option>
              {workforceUsers.map((user) => (
                <option key={user.id} value={user.username}>
                  {user.username} ({user.role})
                </option>
              ))}
            </select>
          ) : null}
          {loginMode !== "operative" ? (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
              placeholder="Correo"
              autoComplete="email"
            />
          ) : null}
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl border border-merka-border bg-merka-black py-2 pl-3 pr-11 text-sm text-white outline-none"
              placeholder="Contraseña"
              autoComplete="current-password"
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
          {loginMode === "operative" && (selectedWorkforce?.role === "driver" || selectedWorkforce?.role === "picker") && (
            <>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
                placeholder="Nombre visible del turno"
              />
              <input
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                list="shift-presets"
                className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
                placeholder="Turno u horario (elige de la lista o escribe, ej. Mañana 06:00-14:00)"
              />
              <datalist id="shift-presets">
                <option value="Mañana 06:00-14:00" />
                <option value="Tarde 14:00-22:00" />
                <option value="Noche 22:00-06:00" />
                <option value="Central 08:00-17:00" />
              </datalist>
            </>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 w-full rounded-xl bg-merka-yellow px-4 py-2.5 font-semibold text-merka-black transition hover:brightness-110 disabled:opacity-60"
        >
          {isLoading ? "Ingresando..." : "Entrar"}
        </button>
        <Link
          href="/"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-merka-border bg-merka-surface px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-merka-yellow hover:text-merka-yellow"
        >
          <Home className="h-4 w-4 text-merka-yellow" aria-hidden />
          Ir al inicio
        </Link>
        <p className="mt-3 text-center text-xs text-zinc-400">
          ¿No tienes cuenta?{" "}
          <Link className="text-merka-yellow underline-offset-2 transition hover:underline" href="/register">
            Regístrate
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Al continuar aceptas nuestros{" "}
          <Link href="/terms#terminos" className="text-merka-yellow underline-offset-2 hover:underline">
            términos
          </Link>
          .
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-merka-black px-4">
          <div className="w-full max-w-md rounded-2xl border border-merka-border bg-merka-surface p-6 text-sm text-zinc-300">
            Cargando inicio de sesión…
          </div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
