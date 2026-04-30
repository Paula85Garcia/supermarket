import { AppShell } from "../../components/app-shell";
import { WorkerProfileCard } from "../../components/worker-profile-card";
import { PickerHeroBanner } from "../../components/picker-hero-banner";
import { PickerOrderQueue } from "../../components/picker-order-queue";

export default function PickerPage() {
  return (
    <AppShell>
      <PickerHeroBanner />
      <section className="mt-4 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h2 className="font-headline text-xl font-semibold text-white">Panel de Alistamiento</h2>
        <p className="mt-1 text-sm text-zinc-400">Prioriza por orden de llegada.</p>
        <WorkerProfileCard role="picker" />
      </section>
      <PickerOrderQueue />
    </AppShell>
  );
}
