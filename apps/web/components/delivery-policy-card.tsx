"use client";

export function DeliveryPolicyCard() {
  const subtotal = 18000;
  const surcharge = subtotal < 20000 ? 2000 : 0;
  const total = subtotal + surcharge;

  return (
    <section className="mt-4 rounded-2xl border border-merka-border bg-merka-surface p-4">
      <h3 className="font-headline text-sm font-semibold text-white">Politica de domicilio</h3>
      <p className="mt-1 text-xs text-zinc-400">
        Domicilio gratis si la compra es mayor a <span className="text-merka-green">$20.000</span>. Si es menor a{" "}
        <span className="text-merka-yellow">$20.000</span>, se aplica recargo de <span className="text-merka-red">$2.000</span>.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg border border-merka-border bg-merka-black p-2 text-zinc-300">Subtotal: ${subtotal.toLocaleString("es-CO")}</div>
        <div className="rounded-lg border border-merka-border bg-merka-black p-2 text-zinc-300">Recargo: ${surcharge.toLocaleString("es-CO")}</div>
        <div className="rounded-lg border border-merka-border bg-merka-black p-2 font-semibold text-merka-green">Total: ${total.toLocaleString("es-CO")}</div>
      </div>
    </section>
  );
}
