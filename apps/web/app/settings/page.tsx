import { cookies } from "next/headers";
import { AppShell } from "../../components/app-shell";
import { SettingsProfileForm } from "../../components/settings-profile-form";
import { SettingsDeleteAccount } from "../../components/settings-delete-account";

export default function SettingsPage() {
  const role = cookies().get("mkx_role")?.value ?? "";
  const showDelete = role === "customer";

  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-6 md:p-8">
        <h2 className="font-headline text-2xl font-semibold text-white">Ajustes</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Actualiza correo, celular y direcciones usadas en pedidos. Se guardan en este navegador.
        </p>
        <SettingsProfileForm />
        <SettingsDeleteAccount show={showDelete} />
      </section>
    </AppShell>
  );
}
