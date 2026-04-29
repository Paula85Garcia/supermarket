"use client";

import { useEffect, useState } from "react";
import { getProfile } from "../lib/workforce";

interface WorkerProfileCardProps {
  role: "driver" | "picker";
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : "";
}

export function WorkerProfileCard({ role }: WorkerProfileCardProps) {
  const [name, setName] = useState("");
  const [shift, setShift] = useState("");

  useEffect(() => {
    const identifier = readCookie("mkx_identifier");
    if (!identifier) return;
    const profile = getProfile(identifier);
    if (!profile) return;
    setName(profile.displayName);
    setShift(profile.shift);
  }, []);

  return (
    <div className="mt-4 rounded-2xl border border-merka-border bg-merka-black p-4">
      <p className="text-xs text-zinc-400">Rol activo: {role === "driver" ? "Domiciliario" : "Alistamiento"}</p>
      <p className="mt-1 text-sm text-white">Nombre en turno: {name || "Sin configurar en login"}</p>
      <p className="mt-1 text-sm text-zinc-300">Horario: {shift || "Sin configurar en login"}</p>
    </div>
  );
}
