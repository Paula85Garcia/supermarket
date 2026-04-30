"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

const hoverSearch =
  "flex w-full items-center gap-3 rounded-2xl border border-merka-border bg-merka-surface px-4 py-3 transition hover:border-merka-yellow/60 hover:shadow-[0_0_0_1px_rgba(255,215,0,0.12)] md:max-w-2xl";

export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (pathname === "/" || pathname.startsWith("/categories")) {
      setQ(searchParams.get("q") ?? "");
    }
  }, [pathname, searchParams.toString(), searchParams]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const term = q.trim();
    if (pathname === "/" || pathname.startsWith("/categories")) {
      const base = pathname.startsWith("/categories") ? pathname.split("?")[0] : "/";
      if (term) {
        router.push(`${base}?q=${encodeURIComponent(term)}`);
        router.refresh();
      } else {
        router.push(base);
        router.refresh();
      }
      return;
    }
    if (term) {
      router.push(`/?q=${encodeURIComponent(term)}`);
      router.refresh();
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <form onSubmit={submit} className={hoverSearch}>
      <Search className="shrink-0 text-zinc-400" size={18} aria-hidden />
      <input
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        enterKeyHint="search"
        placeholder="Buscar producto por nombre…"
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
        aria-label="Buscar productos"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-merka-yellow px-3 py-1 text-xs font-semibold text-black transition hover:brightness-110"
      >
        Buscar
      </button>
    </form>
  );
}
