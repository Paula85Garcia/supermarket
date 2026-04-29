"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getProfile } from "../lib/workforce";

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : "";
}

export function PickerHeroBanner() {
  const [title, setTitle] = useState("Turno");

  useEffect(() => {
    const id = readCookie("mkx_identifier");
    if (!id) return;
    const p = getProfile(id);
    setTitle(p?.shift?.trim() || p?.displayName || "Turno");
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-3xl border border-merka-border bg-gradient-to-r from-zinc-900 to-merka-surface p-6"
    >
      <h2 className="font-headline text-2xl font-semibold text-white md:text-3xl">{title}</h2>
      <p className="mt-2 max-w-xl text-sm text-zinc-400">
        Cola de pedidos por orden de llegada. Prepara segun la lista: imagen y descripcion de cada producto.
      </p>
    </motion.section>
  );
}
