import { AppShell } from "../../components/app-shell";
import { WorkforceManager } from "../../components/workforce-manager";
import { ProductAdminManager } from "../../components/product-admin-manager";
import { AdminOperationalInsights } from "../../components/admin-operational-insights";
import { AdminDashboardQuick } from "../../components/admin-dashboard-quick";

export default function AdminPage() {
  return (
    <AppShell>
      <section className="mt-6">
        <h2 className="font-headline text-2xl font-semibold text-white">Panel Admin</h2>
        <p className="mt-1 text-sm text-zinc-400">Gestión de productos e inventario.</p>
      </section>
      <AdminDashboardQuick />
      <ProductAdminManager />
      <AdminOperationalInsights />
      <WorkforceManager />
    </AppShell>
  );
}
