import { AppShell } from "../../components/app-shell";
import { WorkerProfileCard } from "../../components/worker-profile-card";

export default function DriverPage() {
  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h2 className="font-headline text-2xl font-semibold text-white">Panel Domiciliario</h2>
        <p className="mt-2 text-sm text-zinc-400">Gestiona entregas asignadas, rutas activas y confirmacion de entrega.</p>
        <WorkerProfileCard role="driver" />
      </section>
    </AppShell>
  );
}
