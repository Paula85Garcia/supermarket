import { NextResponse } from "next/server";
import { safeJson } from "../../../../lib/safe-json";

const authServiceUrl = process.env.AUTH_SERVICE_URL ?? "http://localhost:3001";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string; newPassword?: string };
  if (!body.token?.trim() || !body.newPassword || body.newPassword.length < 8) {
    return NextResponse.json(
      { error: { code: "WEB_AUTH_022", message: "Token y nueva contrasena (minimo 8 caracteres) son requeridos" } },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${authServiceUrl}/auth/password-reset-confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: body.token.trim(), newPassword: body.newPassword }),
      cache: "no-store"
    });
    const result = (await safeJson<{ data?: unknown; error?: { message?: string } }>(response)) ?? null;
    if (!response.ok) {
      return NextResponse.json(
        { error: { code: "WEB_AUTH_023", message: result?.error?.message ?? "No se pudo actualizar la contrasena" } },
        { status: response.status || 400 }
      );
    }
    return NextResponse.json(result ?? { data: { success: true } });
  } catch {
    return NextResponse.json(
      { error: { code: "WEB_AUTH_024", message: "Servicio de autenticacion no disponible. Intenta mas tarde." } },
      { status: 503 }
    );
  }
}
