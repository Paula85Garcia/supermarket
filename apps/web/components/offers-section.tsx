"use client";

import { Percent, Truck, Sparkles } from "lucide-react";

const offers = [
  {
    title: "Promo granos de la semana",
    description: "Arroz + frijol + lenteja con 15% OFF",
    color: "bg-merka-yellow text-merka-black",
    icon: Percent
  },
  {
    title: "Domicilio express",
    description: "Entrega prioritaria en zonas seleccionadas",
    color: "bg-merka-green text-white",
    icon: Truck
  },
  {
    title: "Combos IA recomendados",
    description: "Canastas sugeridas por Max segun tu historial",
    color: "bg-merka-red text-white",
    icon: Sparkles
  }
];

export function OffersSection() {
  return (
    <section className="mt-6">
      <h3 className="font-headline text-lg font-semibold text-white">Ofertas y promociones</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {offers.map((offer) => (
          <article key={offer.title} className={`rounded-2xl p-4 ${offer.color}`}>
            <offer.icon size={18} />
            <p className="mt-2 font-headline text-sm font-semibold">{offer.title}</p>
            <p className="mt-1 text-xs opacity-90">{offer.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
