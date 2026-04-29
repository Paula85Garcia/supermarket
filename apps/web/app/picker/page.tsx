import { AppShell } from "../../components/app-shell";
import { WorkerProfileCard } from "../../components/worker-profile-card";

export default function PickerPage() {
  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h2 className="font-headline text-2xl font-semibold text-white">Panel de Alistamiento</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Revisa la cola de pedidos, acepta tareas y marca ordenes listas para despacho.
        </p>
        <WorkerProfileCard role="picker" />
      </section>
    </AppShell>
  );
}
