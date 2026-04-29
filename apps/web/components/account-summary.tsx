"use client";

import { useEffect, useState } from "react";
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
      const response = await fetchWithAutoRefresh("/api/auth/me", { method: "GET" }, { redirectOnAuthFailure: true });
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
    return <p className="mt-3 text-sm text-merka-red">{error}</p>;
  }

  return (
    <div className="mt-4 rounded-xl border border-merka-border bg-merka-black p-4">
      <p className="text-sm text-zinc-300">Correo: {me?.email ?? "N/A"}</p>
      <p className="mt-1 text-sm text-zinc-300">Rol: {me?.role ?? "N/A"}</p>
      <p className="mt-1 text-sm text-zinc-300">Permisos: {(me?.permissions ?? []).join(", ") || "Sin permisos"}</p>
    </div>
  );
}
