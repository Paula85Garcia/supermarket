"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { safeJson } from "../../lib/safe-json";
import { setClientSession } from "../../lib/auth";
import { loadWorkforceUsers, saveProfile, type WorkforceUser } from "../../lib/workforce";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginMode, setLoginMode] = useState<"user" | "operative">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [shift, setShift] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workforceUsers, setWorkforceUsers] = useState<WorkforceUser[]>([]);

  useEffect(() => {
    setWorkforceUsers(loadWorkforceUsers().filter((user) => user.active));
  }, []);

  const selectedWorkforce = useMemo(
    () => workforceUsers.find((user) => user.username.toLowerCase() === email.trim().toLowerCase()),
    [email, workforceUsers]
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    // Local workforce auth for operational users.
    if (loginMode === "operative" && selectedWorkforce) {
      if (selectedWorkforce.password !== password) {
        setError("Credenciales incorrectas para usuario operativo");
        return;
      }
      if ((selectedWorkforce.role === "driver" || selectedWorkforce.role === "picker") && (!displayName.trim() || !shift.trim())) {
        setError("Para este rol debes indicar nombre visible y horario");
        return;
      }
      if (selectedWorkforce.role === "driver" || selectedWorkforce.role === "picker") {
        saveProfile({ username: selectedWorkforce.username, displayName, shift });
      }
      setClientSession(selectedWorkforce.role, selectedWorkforce.username);
      router.push(selectedWorkforce.role === "admin" ? "/admin" : selectedWorkforce.role === "driver" ? "/driver" : "/picker");
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const result =
      (await safeJson<{ data?: { role?: string }; error?: { message?: string } }>(response)) ?? null;
    setIsLoading(false);

    if (!response.ok) {
      setError(result?.error?.message ?? "No fue posible iniciar sesion");
      return;
    }

    router.push(result?.data?.role === "admin" ? "/admin" : "/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-merka-black px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-merka-border bg-merka-surface p-6">
        <h1 className="font-headline text-2xl font-semibold text-white">Iniciar sesion</h1>
        <p className="mt-1 text-sm text-zinc-400">Accede para ver tus pedidos o administrar productos.</p>
        {searchParams.get("reason") === "session_expired" ? (
          <p className="mt-2 text-xs text-merka-red">Tu sesion expiro. Inicia sesion nuevamente.</p>
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
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder={loginMode === "operative" ? "Usuario operativo" : "Correo"}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Contrasena"
          />
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
                className="w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
                placeholder="Horario (ej: 7:00-15:00)"
              />
            </>
          )}
        </div>
        {error ? <p className="mt-3 text-xs text-merka-red">{error}</p> : null}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 w-full rounded-xl bg-merka-yellow px-4 py-2 font-semibold text-merka-black disabled:opacity-60"
        >
          {isLoading ? "Ingresando..." : "Entrar"}
        </button>
        <Link
          href="/"
          className="mt-2 inline-flex w-full justify-center rounded-xl border border-merka-border bg-merka-surface px-4 py-2 text-sm font-semibold text-zinc-200"
        >
          Ir al inicio
        </Link>
        <p className="mt-3 text-center text-xs text-zinc-400">
          No tienes cuenta? <Link className="text-merka-yellow" href="/register">Registrate</Link>
        </p>
      </form>
    </main>
  );
}
