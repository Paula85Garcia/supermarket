import { NextResponse } from "next/server";
import { safeJson } from "../../../../lib/safe-json";

const authServiceUrl = process.env.AUTH_SERVICE_URL ?? "http://localhost:3001";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  if (!body.email?.trim()) {
    return NextResponse.json({ error: { code: "WEB_AUTH_020", message: "Correo requerido" } }, { status: 400 });
  }

  try {
    const response = await fetch(`${authServiceUrl}/auth/password-reset-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email.trim() }),
      cache: "no-store"
    });
    const result = (await safeJson<{ data?: unknown; error?: { message?: string } }>(response)) ?? null;
    if (!response.ok) {
      return NextResponse.json(
        { error: { code: "WEB_AUTH_021", message: result?.error?.message ?? "No se pudo procesar la solicitud" } },
        { status: response.status || 502 }
      );
    }
    return NextResponse.json(result ?? { data: { ok: true } });
  } catch {
    return NextResponse.json({
      data: {
        ok: true,
        message: "Si el correo esta registrado, recibiras un enlace para restablecer la contrasena.",
        offline: true
      }
    });
  }
}
