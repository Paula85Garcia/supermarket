"use client";

import { AppShell } from "./app-shell";
import { HeroBanner } from "./hero-banner";
import { CategoriesRow } from "./categories-row";
import { ProductGrid } from "./product-grid";
import { DeliveryPolicyCard } from "./delivery-policy-card";
import { OffersSection } from "./offers-section";

export function DashboardShell() {
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
