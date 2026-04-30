import { AppShell } from "../../components/app-shell";
import { AccountSummary } from "../../components/account-summary";
import { RecentOrdersTimeline } from "../../components/recent-orders-timeline";

export default function AccountPage() {
  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h2 className="font-headline text-2xl font-semibold text-white">Mi cuenta</h2>
        <p className="mt-2 text-sm text-zinc-400">Gestiona tus datos personales, direcciones y metodos de pago.</p>
        <AccountSummary />
      </section>
      <section className="mt-5 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h3 className="font-headline text-lg font-semibold text-white">Pedidos recientes</h3>
        <p className="mt-1 text-xs text-zinc-500">Linea de tiempo del envio (pedidos guardados en este dispositivo).</p>
        <RecentOrdersTimeline />
      </section>
    </AppShell>
  );
}
