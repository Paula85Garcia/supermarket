"use client";

import { FormEvent, useEffect, useState } from "react";
import { loadCustomerLocalProfile, saveCustomerLocalProfile, type CustomerLocalProfile } from "../lib/customer-local-profile";
import { safeJson } from "../lib/safe-json";

export function SettingsProfileForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [altDeliveryAddress, setAltDeliveryAddress] = useState("");
  const [serverEmail, setServerEmail] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = loadCustomerLocalProfile();
    if (p) {
      setFullName(p.fullName);
      setEmail(p.email);
      setWhatsappPhone(p.whatsappPhone);
      setHomeAddress(p.homeAddress);
      setAltDeliveryAddress(p.altDeliveryAddress ?? "");
    }
    void (async () => {
      const res = await fetch("/api/auth/me?optional=1", { credentials: "include" });
      const body = (await safeJson<{ data?: { email?: string; authenticated?: boolean } }>(res)) ?? null;
      const email = body?.data?.email;
      if (res.ok && email && body?.data?.authenticated !== false) setServerEmail(email);
    })();
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: CustomerLocalProfile = {
      fullName: fullName.trim(),
      email: email.trim(),
      whatsappPhone: whatsappPhone.trim(),
      homeAddress: homeAddress.trim(),
      altDeliveryAddress: altDeliveryAddress.trim() || undefined
    };
    saveCustomerLocalProfile(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-6 max-w-lg space-y-4 text-left">
      {serverEmail ? (
        <p className="rounded-xl border border-merka-border bg-merka-black/40 px-3 py-2 text-xs text-zinc-400">
          Correo en sesión del servidor: <span className="font-medium text-zinc-200">{serverEmail}</span>. Puedes guardar otro
          correo de contacto abajo para pedidos y WhatsApp.
        </p>
      ) : null}
      <div>
        <label className="text-xs font-medium text-zinc-400">Nombre</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
          placeholder="Nombre completo"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-400">Correo de contacto</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
          placeholder="correo@ejemplo.com"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-400">Celular / WhatsApp</label>
        <input
          value={whatsappPhone}
          onChange={(e) => setWhatsappPhone(e.target.value)}
          className="mt-1 w-full rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
          placeholder="+57 300…"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-400">Dirección principal</label>
        <textarea
          value={homeAddress}
          onChange={(e) => setHomeAddress(e.target.value)}
          rows={3}
          className="mt-1 w-full resize-y rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
          placeholder="Barrio, calle, número, referencia"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-400">Dirección alternativa (entregas)</label>
        <textarea
          value={altDeliveryAddress}
          onChange={(e) => setAltDeliveryAddress(e.target.value)}
          rows={2}
          className="mt-1 w-full resize-y rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
          placeholder="Opcional: oficina u otra dirección habitual"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-merka-yellow px-4 py-2.5 text-sm font-semibold text-merka-black transition hover:brightness-110"
      >
        Guardar datos locales
      </button>
      {saved ? <p className="text-center text-xs text-merka-green">Guardado en este dispositivo.</p> : null}
      <p className="text-xs text-zinc-500">
        Estos datos se guardan en tu navegador para rellenar checkout más rápido. Para cambiar la contraseña o el correo de
        acceso usa el flujo de recuperación cuando esté disponible.
      </p>
    </form>
  );
}
