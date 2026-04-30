"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAutoRefresh } from "../lib/fetch-with-auth";

interface MeData {
  data?: {
    id?: string;
    email?: string;
    fullName?: string;
    role?: string;
    permissions?: string[];
  };
}

export function AccountSummary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<MeData["data"]>();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const response = await fetchWithAutoRefresh("/api/auth/me", { method: "GET" }, { redirectOnAuthFailure: false });
      const result = (await response.json()) as MeData & { error?: { message?: string } };
      setLoading(false);

      if (!response.ok) {
        setError(result.error?.message ?? "No se pudo cargar tu cuenta");
        return;
      }
      setMe(result.data);
    };
    void load();
  }, []);

  if (loading) {
    return <p className="mt-3 text-sm text-zinc-400">Cargando datos de cuenta...</p>;
  }
  if (error) {
    return (
      <div className="mt-3 rounded-xl border border-merka-red/40 bg-merka-red/10 px-4 py-3 text-sm text-zinc-200">
        <p className="text-merka-red">{error}</p>
        <Link href="/login" className="mt-2 inline-block text-merka-yellow underline-offset-2 hover:underline">
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-merka-border bg-merka-black p-4">
      <p className="text-sm text-zinc-300">Correo: {me?.email ?? "N/A"}</p>
      <p className="mt-1 text-sm text-zinc-300">Rol: {me?.role ?? "N/A"}</p>
      <p className="mt-1 text-sm text-zinc-300">Permisos: {(me?.permissions ?? []).join(", ") || "Sin permisos"}</p>
    </div>
  );
}
