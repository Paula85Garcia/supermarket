import type { ReactNode } from "react";
import Link from "next/link";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="font-headline text-lg font-semibold text-merka-yellow">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-300">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-merka-black px-4 py-10 text-zinc-200">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-merka-border bg-merka-surface px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-merka-yellow hover:text-merka-yellow"
        >
          Volver al inicio
        </Link>

        <nav className="mt-8 flex flex-wrap gap-2 text-xs font-semibold">
          <a
            href="#terminos"
            className="rounded-lg border border-merka-border bg-merka-surface px-3 py-2 text-merka-yellow transition hover:border-merka-yellow"
          >
            Términos y Condiciones
          </a>
          <a
            href="#privacidad"
            className="rounded-lg border border-merka-border bg-merka-surface px-3 py-2 text-merka-green transition hover:border-merka-green"
          >
            Política de Privacidad
          </a>
        </nav>

        <article className="mt-10 space-y-12">
          <header>
            <h1 id="terminos" className="scroll-mt-24 font-headline text-2xl font-semibold text-white">
              Términos y Condiciones de registro
            </h1>
            <p className="mt-2 text-sm text-zinc-400">MERKAMAX · Documento informativo para usuarios registrados</p>
          </header>

          <Section title="1. Aceptación de los términos">
            <p>
              Al registrarse en nuestra plataforma, el usuario declara haber leído, entendido y aceptado los presentes
              Términos y Condiciones. Si no está de acuerdo con alguno de estos, deberá abstenerse de registrarse o
              utilizar nuestros servicios.
            </p>
          </Section>

          <Section title="2. Registro de usuario">
            <p>
              Para acceder a ciertos servicios, el usuario deberá proporcionar información veraz, completa y actualizada.
              El usuario es responsable de mantener la confidencialidad de sus datos de acceso y de todas las actividades
              realizadas desde su cuenta.
            </p>
          </Section>

          <Section title="3. Uso de la plataforma">
            <p>
              El usuario se compromete a utilizar la plataforma de manera adecuada, respetando la ley, la moral y el
              orden público. Está prohibido:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Usar la plataforma con fines fraudulentos o ilícitos</li>
              <li>Interferir en el funcionamiento del sistema</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
            </ul>
          </Section>

          <Section title="4. Protección de datos personales">
            <p>
              La información proporcionada será tratada conforme a nuestra política de privacidad. Nos comprometemos a
              proteger los datos personales del usuario y a utilizarlos únicamente para fines relacionados con la
              prestación del servicio.
            </p>
          </Section>

          <Section title="5. Propiedad intelectual">
            <p>
              Todos los contenidos de la plataforma (textos, imágenes, logos, software, entre otros) son propiedad de la
              empresa o cuentan con autorización para su uso. Está prohibida su reproducción sin autorización previa.
            </p>
          </Section>

          <Section title="6. Responsabilidad">
            <p>La empresa no se hace responsable por:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Interrupciones del servicio por causas técnicas</li>
              <li>Pérdida de información por fallas externas</li>
              <li>Uso indebido de la cuenta por parte del usuario</li>
            </ul>
          </Section>

          <Section title="7. Suspensión o cancelación de cuentas">
            <p>
              Nos reservamos el derecho de suspender o cancelar cuentas que incumplan estos términos o que presenten
              comportamientos sospechosos.
            </p>
          </Section>

          <Section title="8. Modificaciones">
            <p>
              La empresa podrá modificar estos términos en cualquier momento. Las modificaciones serán notificadas a
              través de la plataforma y entrarán en vigor desde su publicación.
            </p>
          </Section>

          <Section title="9. Legislación aplicable">
            <p>
              Estos términos se rigen por las leyes de Colombia. Cualquier controversia será resuelta ante las
              autoridades competentes del país.
            </p>
          </Section>

          <Section title="10. Contacto">
            <p>
              Para cualquier duda o solicitud relacionada con estos términos, el usuario podrá comunicarse a través de
              los canales oficiales de atención de la empresa.
            </p>
          </Section>

          <div className="rounded-xl border border-merka-yellow/30 bg-merka-yellow/5 px-4 py-3 text-sm text-zinc-200">
            <p>
              Al registrarse, el usuario acepta expresamente estos Términos y Condiciones.
            </p>
          </div>

          <hr className="border-merka-border" />

          <header id="privacidad" className="scroll-mt-24">
            <h2 className="font-headline text-2xl font-semibold text-merka-green">
              Política de Privacidad y Tratamiento de Datos Personales
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia
            </p>
          </header>

          <Section title="1. Introducción">
            <p>
              En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia, informamos a los usuarios
              sobre el tratamiento de sus datos personales al utilizar nuestra plataforma.
            </p>
          </Section>

          <Section title="2. Responsable del tratamiento">
            <p>
              El responsable del tratamiento de los datos personales es la empresa propietaria de la plataforma (en
              adelante, &quot;la empresa&quot;).
            </p>
          </Section>

          <Section title="3. Datos que recopilamos">
            <p>Podemos recopilar la siguiente información:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Información de acceso (usuario y contraseña)</li>
              <li>Datos de uso dentro de la plataforma</li>
            </ul>
          </Section>

          <Section title="4. Finalidad del tratamiento">
            <p>Los datos personales serán utilizados para:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Gestionar el registro del usuario</li>
              <li>Brindar acceso a la plataforma</li>
              <li>Mejorar nuestros servicios</li>
              <li>Enviar información relacionada con la cuenta o el servicio</li>
              <li>Cumplir obligaciones legales</li>
            </ul>
          </Section>

          <Section title="5. Derechos del titular">
            <p>El usuario tiene derecho a:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Conocer, actualizar y rectificar sus datos</li>
              <li>Solicitar prueba de la autorización otorgada</li>
              <li>Ser informado sobre el uso de sus datos</li>
              <li>Revocar la autorización y/o solicitar la eliminación de sus datos</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC)</li>
            </ul>
          </Section>

          <Section title="6. Seguridad de la información">
            <p>
              Implementamos medidas de seguridad técnicas, humanas y administrativas para proteger los datos personales
              contra acceso no autorizado, pérdida o alteración.
            </p>
          </Section>

          <Section title="7. Transferencia y transmisión de datos">
            <p>
              La empresa no venderá ni compartirá los datos personales con terceros sin autorización, salvo obligación
              legal o cuando sea necesario para prestar el servicio.
            </p>
          </Section>

          <Section title="8. Uso de cookies">
            <p>
              La plataforma puede utilizar cookies para mejorar la experiencia del usuario y analizar el uso del sitio
              web.
            </p>
          </Section>

          <Section title="9. Vigencia de la información">
            <p>
              Los datos personales se conservarán durante el tiempo necesario para cumplir con las finalidades
              descritas o mientras exista una relación con el usuario.
            </p>
          </Section>

          <Section title="10. Modificaciones">
            <p>
              La empresa podrá actualizar esta política en cualquier momento. Los cambios serán informados a través de
              la plataforma.
            </p>
          </Section>

          <Section title="11. Contacto">
            <p>
              Para ejercer sus derechos o realizar consultas, el usuario puede comunicarse a través de los canales
              oficiales de la empresa.
            </p>
          </Section>

          <div className="rounded-xl border border-merka-green/30 bg-merka-green/5 px-4 py-3 text-sm text-zinc-200">
            <p>
              Al registrarse y utilizar la plataforma, el usuario autoriza el tratamiento de sus datos personales
              conforme a esta política.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
