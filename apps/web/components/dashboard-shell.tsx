"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPromotionalProducts } from "../lib/catalog-merge";
import { maybePushPromoDigestOncePerSession } from "../lib/app-notifications";
import { AppShell } from "./app-shell";
import { HeroBanner } from "./hero-banner";
import { CategoriesRow } from "./categories-row";
import { ProductGrid } from "./product-grid";
import { DeliveryPolicyCard } from "./delivery-policy-card";
import { OffersSection } from "./offers-section";

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : "";
}

export function DashboardShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  /** Primitivo derivado: `searchParams` a veces mantiene identidad y no re-renderiza al cambiar solo ?q= */
  const querySignature = searchParams.toString();
  const welcomeRegister = searchParams.get("registered") === "1";
  const accountDeleted = searchParams.get("account_deleted") === "1";
  const catalogSearch = useMemo(() => searchParams.get("q") ?? "", [querySignature, searchParams]);

  useEffect(() => {
    const role = readCookie("mkx_role");
    const op = readCookie("mkx_token");
    if (op && role === "picker") router.replace("/picker");
    if (op && role === "driver") router.replace("/driver");
  }, [router]);

  useEffect(() => {
    const promoCount = getPromotionalProducts().length;
    maybePushPromoDigestOncePerSession(promoCount);
  }, []);

  return (
    <AppShell>
      {welcomeRegister ? (
        <div
          className="mb-4 rounded-2xl border border-merka-green/50 bg-merka-green/10 px-4 py-3 text-sm text-zinc-100"
          role="status"
        >
          <span className="font-semibold text-merka-green">Cuenta creada.</span> Ya puedes armar tu pedido; revisa
          categorías y ofertas abajo.
        </div>
      ) : null}
      {accountDeleted ? (
        <div
          className="mb-4 rounded-2xl border border-merka-yellow/50 bg-merka-yellow/10 px-4 py-3 text-sm text-zinc-100"
          role="status"
        >
          <span className="font-semibold text-merka-yellow">Cuenta eliminada.</span> Tu sesión en el servidor ya no
          existe. Puedes volver a registrarte cuando quieras.
        </div>
      ) : null}
      <HeroBanner />
      <DeliveryPolicyCard />
      <OffersSection />
      <CategoriesRow />
      <ProductGrid key={`catalog-${querySignature}`} searchQuery={catalogSearch} />
    </AppShell>
  );
}
