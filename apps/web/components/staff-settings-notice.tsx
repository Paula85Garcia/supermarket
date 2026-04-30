type Role = "admin" | "picker" | "driver";

const copy: Record<Role, { title: string; body: string }> = {
  admin: {
    title: "Cuenta de administración",
    body: "Nombre, correo de contacto y dirección del cliente no se configuran aquí. Usa el panel de productos y el equipo operativo desde el menú correspondiente."
  },
  picker: {
    title: "Cuenta de alistamiento",
    body: "Los datos de pedido del comprador se gestionan en su propia sesión. Aquí solo verías ajustes si inicias como cliente."
  },
  driver: {
    title: "Cuenta de domiciliario",
    body: "Los datos de entrega del cliente no se editan desde esta pantalla en rol de reparto."
  }
};

export function StaffSettingsNotice({ role }: { role: Role }) {
  const c = copy[role];
  return (
    <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-merka-border bg-merka-black/40 px-4 py-5 text-left">
      <h3 className="font-headline text-lg font-semibold text-white">{c.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{c.body}</p>
    </div>
  );
}
