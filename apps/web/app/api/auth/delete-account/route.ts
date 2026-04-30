import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeJson } from "../../../../lib/safe-json";

const authServiceUrl = process.env.AUTH_SERVICE_URL ?? "http://localhost:3001";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const access = cookieStore.get("mkx_access_token")?.value;
  if (!access) {
    return NextResponse.json({ error: { code: "WEB_AUTH_025", message: "No hay sesion" } }, { status: 401 });
  }

  const body = (await request.json()) as { password?: string };
  if (!body.password || body.password.length < 8) {
    return NextResponse.json({ error: { code: "WEB_AUTH_027", message: "Contrasena actual requerida" } }, { status: 400 });
  }

  if (access === "demo-access-token") {
    const res = NextResponse.json({ data: { deleted: true, fallback: true } });
    res.cookies.set("mkx_access_token", "", { path: "/", maxAge: 0 });
    res.cookies.set("mkx_refresh_token", "", { path: "/", maxAge: 0 });
    res.cookies.set("mkx_role", "", { path: "/", maxAge: 0 });
    res.cookies.set("mkx_token", "", { path: "/", maxAge: 0 });
    return res;
  }

  try {
    const response = await fetch(`${authServiceUrl}/auth/me`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`
      },
      body: JSON.stringify({ password: body.password }),
      cache: "no-store"
    });
    const result = (await safeJson<{ data?: { deleted?: boolean }; error?: { message?: string } }>(response)) ?? null;
    if (!response.ok) {
      return NextResponse.json(
        { error: { code: "WEB_AUTH_029", message: result?.error?.message ?? "No se pudo eliminar la cuenta" } },
        { status: response.status || 400 }
      );
    }
    const res = NextResponse.json(result ?? { data: { deleted: true } });
    res.cookies.set("mkx_access_token", "", { path: "/", maxAge: 0 });
    res.cookies.set("mkx_refresh_token", "", { path: "/", maxAge: 0 });
    res.cookies.set("mkx_role", "", { path: "/", maxAge: 0 });
    res.cookies.set("mkx_token", "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return NextResponse.json({ error: { code: "WEB_AUTH_030", message: "Servicio no disponible" } }, { status: 503 });
  }
}
