import { AppShell } from "../../components/app-shell";
import { CloudSyncCard } from "../../components/cloud-sync-card";
import { ImageUploader } from "../../components/image-uploader";
import { WorkforceManager } from "../../components/workforce-manager";
import { ProductAdminManager } from "../../components/product-admin-manager";

export default function AdminPage() {
  return (
    <AppShell>
      <section className="mt-6">
        <h2 className="font-headline text-2xl font-semibold text-white">Panel Admin</h2>
        <p className="mt-1 text-sm text-zinc-400">Gestion de productos, inventario y publicaciones del catalogo.</p>
      </section>
      <section className="mt-4 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h3 className="font-headline text-lg font-semibold text-white">Crear productos</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Esta seccion es solo para Admin. Aqui se cargan imagenes de productos a la nube y se prepara la publicacion.
        </p>
        <CloudSyncCard />
        <ImageUploader />
      </section>
      <ProductAdminManager />
      <WorkforceManager />
    </AppShell>
  );
}
