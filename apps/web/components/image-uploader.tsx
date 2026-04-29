"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export function ImageUploader() {
  const [status, setStatus] = useState<string>("Selecciona una imagen");
  const [url, setUrl] = useState<string>("");

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("Subiendo...");
    const form = new FormData();
    form.append("file", file);
    form.append("folder", `merkamax/products/${new Date().getFullYear()}`);

    const res = await fetch("/api/uploads", {
      method: "POST",
      body: form
    });
    const result = (await res.json()) as { data?: { secure_url?: string }; error?: { message?: string } };

    if (!res.ok || !result.data?.secure_url) {
      setStatus(result.error?.message ?? "Error al subir");
      return;
    }
    setUrl(result.data.secure_url);
    setStatus("Subida completada");
  };

  return (
    <section className="mt-4 rounded-2xl border border-merka-border bg-merka-surface p-4">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-merka-yellow px-4 py-2 text-sm font-semibold text-merka-black">
        <Upload size={16} />
        Subir foto a Cloudinary
        <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
      </label>
      <p className="mt-2 text-xs text-zinc-400">{status}</p>
      {url ? <p className="mt-1 truncate text-xs text-merka-green">{url}</p> : null}
    </section>
  );
}
