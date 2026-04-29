import { AppShell } from "../../components/app-shell";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h2 className="font-headline text-2xl font-semibold text-white">Historial de pedidos</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Aqui veras el historial completo de compras, estados de entrega y recibos.
        </p>
        <Link
          href="/orders/demo-123/track"
          className="mt-4 inline-flex rounded-xl bg-merka-yellow px-4 py-2 text-sm font-semibold text-merka-black"
        >
          Rastrear ultimo pedido
        </Link>
      </section>
    </AppShell>
  );
}
