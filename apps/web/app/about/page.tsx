import { AppShell } from "../../components/app-shell";

export default function AboutPage() {
  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-6 transition duration-300 hover:-translate-y-0.5 hover:border-merka-yellow/50 hover:shadow-glow">
        <h2 className="font-headline text-2xl font-semibold text-white">Sobre Nosotros</h2>
        <p className="mt-3 text-sm text-zinc-300">
          Somos una empresa comprometida con la gestion eficiente de inventarios y procesos logisticos, orientada a
          garantizar la disponibilidad de productos y la satisfaccion del cliente.
        </p>
        <p className="mt-3 text-sm text-zinc-300">
          Trabajamos bajo un modelo organizado y estructurado que integra tecnologia, control y mejora continua,
          permitiendo optimizar cada etapa del proceso, desde la recepcion de mercancia hasta su entrega final.
        </p>
        <p className="mt-3 text-sm text-zinc-300">
          Nuestro enfoque se basa en la implementacion de buenas practicas logisticas, apoyadas en herramientas
          tecnologicas como sistemas de gestion de inventarios (WMS), lectores de codigo de barras y analisis de
          datos, lo que nos permite tomar decisiones oportunas y reducir errores operativos.
        </p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-merka-border bg-merka-surface p-5 transition duration-300 hover:-translate-y-0.5 hover:border-merka-yellow/50 hover:shadow-glow">
          <h3 className="font-headline text-xl font-semibold text-merka-yellow">Mision</h3>
          <p className="mt-2 text-sm text-zinc-300">
            Brindar un servicio logistico eficiente mediante el control y optimizacion de inventarios, asegurando la
            disponibilidad de productos, la exactitud de la informacion y la satisfaccion del cliente, apoyandonos en
            herramientas tecnologicas y procesos estandarizados.
          </p>
        </article>
        <article className="rounded-2xl border border-merka-border bg-merka-surface p-5 transition duration-300 hover:-translate-y-0.5 hover:border-merka-green/60 hover:shadow-glow">
          <h3 className="font-headline text-xl font-semibold text-merka-green">Vision</h3>
          <p className="mt-2 text-sm text-zinc-300">
            Ser reconocidos como una empresa lider en la gestion logistica y control de inventarios, destacandonos por
            nuestra precision, innovacion tecnologica y capacidad de adaptacion, logrando altos niveles de servicio y
            eficiencia operativa.
          </p>
        </article>
      </section>

      <section className="mt-4 rounded-2xl border border-merka-border bg-merka-surface p-6 transition duration-300 hover:-translate-y-0.5 hover:border-merka-yellow/50 hover:shadow-glow">
        <h3 className="font-headline text-xl font-semibold text-white">Valores Corporativos</h3>
        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
          <li>
            <span className="font-semibold text-white">Responsabilidad:</span> Cumplimos con cada proceso garantizando
            exactitud y confiabilidad en la informacion.
          </li>
          <li>
            <span className="font-semibold text-white">Eficiencia:</span> Optimizamos recursos y tiempos para lograr
            mejores resultados operativos.
          </li>
          <li>
            <span className="font-semibold text-white">Innovacion:</span> Incorporamos herramientas tecnologicas que
            mejoran continuamente nuestros procesos.
          </li>
          <li>
            <span className="font-semibold text-white">Trabajo en equipo:</span> Fomentamos la colaboracion entre
            areas para alcanzar objetivos comunes.
          </li>
          <li>
            <span className="font-semibold text-white">Transparencia:</span> Mantenemos claridad en los procesos,
            registros y toma de decisiones.
          </li>
        </ul>
      </section>

      <section className="mt-4 rounded-2xl border border-merka-border bg-merka-surface p-6 transition duration-300 hover:-translate-y-0.5 hover:border-merka-yellow/50 hover:shadow-glow">
        <h3 className="font-headline text-xl font-semibold text-white">Nuestro Enfoque de Trabajo</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
          <li>Antes del inventario: planificacion, organizacion y capacitacion del personal.</li>
          <li>Durante el inventario: ejecucion controlada con herramientas tecnologicas.</li>
          <li>Despues del inventario: analisis, ajustes y toma de decisiones.</li>
        </ol>
        <div className="mt-4 rounded-xl border border-merka-border bg-merka-black p-4 text-sm text-zinc-300">
          <p className="font-semibold text-white">Esto nos permite garantizar:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Alta exactitud en inventarios.</li>
            <li>Mejor nivel de servicio al cliente.</li>
            <li>Control eficiente de productos criticos (clasificacion ABC).</li>
          </ul>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-merka-border bg-merka-surface p-6 transition duration-300 hover:-translate-y-0.5 hover:border-merka-yellow/50 hover:shadow-glow">
        <h3 className="font-headline text-xl font-semibold text-white">Compromiso con la Calidad</h3>
        <p className="mt-2 text-sm text-zinc-300">
          Trabajamos con indicadores clave que aseguran el desempeno de la operacion:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
          <li>Exactitud de inventarios: control preciso de existencias.</li>
          <li>Nivel de servicio: cumplimiento de pedidos completos.</li>
          <li>Rotacion de inventarios: optimizacion del flujo de productos.</li>
        </ul>
      </section>
    </AppShell>
  );
}
