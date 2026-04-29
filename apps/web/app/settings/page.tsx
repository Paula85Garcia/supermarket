import { AppShell } from "../../components/app-shell";

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-8 text-center">
        <h2 className="font-headline text-2xl font-semibold text-white">Ajustes</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">Por ahora esta seccion esta vacia. Pronto podras configurar preferencias desde aqui.</p>
      </section>
    </AppShell>
  );
}
