import Link from "next/link";
import { AppShell } from "../../components/app-shell";

const views = [
  { title: "Vista Cliente", href: "/", description: "Catalogo, carrito y compras." },
  { title: "Vista Domiciliario", href: "/driver", description: "Rutas, entregas y estado de pedidos." },
  { title: "Vista Alistamiento", href: "/picker", description: "Cola de alistamiento y preparacion." },
  { title: "Vista Administrador", href: "/admin", description: "Crear productos y gestion de catalogo." }
];

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h2 className="font-headline text-2xl font-semibold text-white">Ajustes y vistas operativas</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Desde aqui puedes navegar a cada perfil de operacion: cliente, domiciliario, alistamiento y administrador.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {views.map((view) => (
            <Link
              key={view.href}
              href={view.href}
              className="rounded-xl border border-merka-border bg-merka-black p-4 transition hover:bg-merka-yellow hover:text-merka-black"
            >
              <p className="font-headline text-sm font-semibold">{view.title}</p>
              <p className="mt-1 text-xs opacity-80">{view.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
