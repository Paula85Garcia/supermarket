"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../../../components/app-shell";
import { fetchWithAutoRefresh } from "../../../../lib/fetch-with-auth";
import { getOrderDriverAssignment } from "../../../../lib/workforce";

interface TrackPageProps {
  params: { id: string };
}

export default function TrackOrderPage({ params }: TrackPageProps) {
  const mapsEmbed = "https://maps.google.com/maps?q=4.7110,-74.0721&z=13&output=embed";
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [loadingEta, setLoadingEta] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [driverShift, setDriverShift] = useState("");
  const wazeUrl = "https://waze.com/ul?ll=4.7110,-74.0721&navigate=yes";
  const gmapsUrl = "https://www.google.com/maps/dir/?api=1&destination=4.7110,-74.0721&travelmode=driving";

  useEffect(() => {
    const loadEta = async () => {
      setLoadingEta(true);
      const assignment = getOrderDriverAssignment(params.id);
      if (assignment) {
        setDriverName(assignment.displayName);
        setDriverShift(assignment.shift);
      }
      const response = await fetchWithAutoRefresh(`/api/orders/${params.id}/eta`, { method: "GET" }, { redirectOnAuthFailure: false });
      const result = (await response.json()) as { data?: { eta_minutes?: number } };
      setLoadingEta(false);

      if (response.status === 401) {
        setSessionExpired(true);
        setTimeout(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login?reason=session_expired";
        }, 1800);
        return;
      }

      setEtaMinutes(result.data?.eta_minutes ?? 22);
    };

    void loadEta();
  }, [params.id]);

  return (
    <AppShell>
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-merka-border bg-merka-surface p-4">
          <h2 className="font-headline text-xl font-semibold text-white">Tracking pedido #{params.id}</h2>
          <p className="mt-1 text-sm text-zinc-400">Ubicacion en tiempo real del domiciliario y ruta de entrega.</p>
          {driverName ? (
            <p className="mt-1 text-xs text-merka-yellow">Tu pedido lo lleva: {driverName} · {driverShift}</p>
          ) : null}
          <div className="mt-4 overflow-hidden rounded-xl border border-merka-border">
            <iframe title="mapa de tracking" src={mapsEmbed} className="h-[360px] w-full" loading="lazy" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-merka-border bg-merka-surface p-4">
            <p className="text-sm text-zinc-400">ETA estimado</p>
            <p className="font-headline text-3xl font-bold text-merka-green">
              {loadingEta ? "..." : `${etaMinutes ?? 22} min`}
            </p>
            {sessionExpired ? (
              <p className="mt-2 text-xs text-merka-red">Sesion expirada. Redirigiendo a login...</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-merka-border bg-merka-surface p-4">
            <p className="mb-3 text-sm text-zinc-300">Navegacion sugerida para driver</p>
            <div className="flex gap-2">
              <a href={wazeUrl} target="_blank" className="rounded-xl bg-merka-yellow px-3 py-2 text-xs font-semibold text-merka-black">
                Abrir Waze
              </a>
              <a href={gmapsUrl} target="_blank" className="rounded-xl bg-merka-red px-3 py-2 text-xs font-semibold text-white">
                Abrir Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
