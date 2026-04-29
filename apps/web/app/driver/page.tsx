import { AppShell } from "../../components/app-shell";
import { WorkerProfileCard } from "../../components/worker-profile-card";
import { DriverDeliveryBoard } from "../../components/driver-delivery-board";

export default function DriverPage() {
  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h2 className="font-headline text-2xl font-semibold text-white">Panel Domiciliario</h2>
        <p className="mt-2 text-sm text-zinc-400">Entregas, pago y confirmacion con alistamiento. La campanita en la barra muestra pedidos listos.</p>
        <WorkerProfileCard role="driver" />
      </section>
      <DriverDeliveryBoard />
    </AppShell>
  );
}
