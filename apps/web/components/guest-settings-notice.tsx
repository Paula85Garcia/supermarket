import Link from "next/link";

export function GuestSettingsNotice() {
  return (
    <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-merka-border bg-merka-black/40 px-4 py-5 text-center">
      <p className="text-sm text-zinc-400">
        Inicia sesión como <span className="font-semibold text-white">comprador</span> para guardar nombre, correo, celular y dirección en este dispositivo.
      </p>
      <Link
        href="/login"
        className="mt-4 inline-flex rounded-xl bg-merka-yellow px-4 py-2 text-sm font-semibold text-merka-black transition hover:brightness-110"
      >
        Ir a inicio de sesión
      </Link>
    </div>
  );
}
