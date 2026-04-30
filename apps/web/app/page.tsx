import { Suspense } from "react";
import { DashboardShell } from "../components/dashboard-shell";

/** Búsqueda con ?q= depende de la URL; evita caché estática que ignore query. */
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-merka-black px-4 py-10 text-center text-sm text-zinc-400">Cargando…</div>
      }
    >
      <DashboardShell />
    </Suspense>
  );
}
