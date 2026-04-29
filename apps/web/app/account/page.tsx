import { AppShell } from "../../components/app-shell";
import { AccountSummary } from "../../components/account-summary";

export default function AccountPage() {
  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h2 className="font-headline text-2xl font-semibold text-white">Mi cuenta</h2>
        <p className="mt-2 text-sm text-zinc-400">Gestiona tus datos personales, direcciones y metodos de pago.</p>
        <AccountSummary />
      </section>
    </AppShell>
  );
}
