import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeJson } from "../../../../lib/safe-json";

const authServiceUrl = process.env.AUTH_SERVICE_URL ?? "http://localhost:3001";

export async function POST() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("mkx_refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: { code: "WEB_AUTH_006", message: "Sesion expirada" } }, { status: 401 });
  }

  const refreshResponse = await fetch(`${authServiceUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store"
  });
  const refreshResult = (await safeJson<{
    data?: { accessToken?: string };
    error?: { code?: string; message?: string };
  }>(refreshResponse)) ?? null;

  if (!refreshResponse.ok || !refreshResult?.data?.accessToken) {
    return NextResponse.json(
      {
        error: {
          code: refreshResult?.error?.code ?? "WEB_AUTH_007",
          message: refreshResult?.error?.message ?? "No se pudo renovar la sesion"
        }
      },
      { status: refreshResponse.status || 401 }
    );
  }

  const response = NextResponse.json({ data: { refreshed: true } });
  response.cookies.set("mkx_access_token", refreshResult.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60
  });
  return response;
}
