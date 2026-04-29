"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
  useEffect(() => {
    const role = readCookie("mkx_role");
    const op = readCookie("mkx_token");
    if (op && role === "picker") router.replace("/picker");
    if (op && role === "driver") router.replace("/driver");
  }, [router]);

  return (
    <AppShell>
      <HeroBanner />
      <DeliveryPolicyCard />
      <OffersSection />
      <CategoriesRow />
      <ProductGrid />
    </AppShell>
  );
}
