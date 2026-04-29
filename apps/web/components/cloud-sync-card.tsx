"use client";

import { CloudUpload } from "lucide-react";

export function CloudSyncCard() {
  return (
    <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-merka-yellow/10 p-2 text-merka-yellow">
          <CloudUpload size={18} />
        </div>
        <div>
          <h3 className="font-headline text-sm font-semibold text-white">Carga en nube activa</h3>
          <p className="mt-1 text-xs text-zinc-400">
            Cloud name: <span className="text-merka-yellow">dky2dscgr</span> · Modo carpeta:{" "}
            <span className="text-merka-green">Carpetas dinamicas</span>
          </p>
        </div>
      </div>
    </section>
  );
}
