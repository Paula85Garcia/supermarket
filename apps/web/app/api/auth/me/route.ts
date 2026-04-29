import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeJson } from "../../../../lib/safe-json";

const authServiceUrl = process.env.AUTH_SERVICE_URL ?? "http://localhost:3001";

const fetchMe = async (accessToken: string) =>
  fetch(`${authServiceUrl}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  const response = await fetch(`${authServiceUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store"
  });
  const result = (await safeJson<{ data?: { accessToken?: string } }>(response)) ?? null;
  if (!response.ok || !result?.data?.accessToken) return null;
  return result.data.accessToken;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const optionalSession = searchParams.get("optional") === "1";
  const cookieStore = cookies();
  const currentAccessToken = cookieStore.get("mkx_access_token")?.value;
  const refreshToken = cookieStore.get("mkx_refresh_token")?.value;

  let accessToken = currentAccessToken ?? null;
  let refreshed = false;

  if (!accessToken && refreshToken) {
    accessToken = await refreshAccessToken(refreshToken);
    refreshed = Boolean(accessToken);
  }

  if (!accessToken) {
    if (optionalSession) {
      return NextResponse.json({ data: { authenticated: false } });
    }
    return NextResponse.json({ error: { code: "WEB_AUTH_008", message: "No autenticado" } }, { status: 401 });
  }

  let meResponse = await fetchMe(accessToken);
  if (meResponse.status === 401 && refreshToken) {
    const nextAccessToken = await refreshAccessToken(refreshToken);
    if (nextAccessToken) {
      accessToken = nextAccessToken;
      refreshed = true;
      meResponse = await fetchMe(accessToken);
    }
  }

  const meResult = await safeJson<Record<string, unknown>>(meResponse);
  if (!meResponse.ok) {
    if (optionalSession) {
      return NextResponse.json({ data: { authenticated: false } });
    }
    return NextResponse.json(
      { error: { code: "WEB_AUTH_009", message: "Sesion invalida" } },
      { status: meResponse.status || 401 }
    );
  }

  const response = NextResponse.json(meResult ?? { data: { authenticated: true } });
  if (refreshed && accessToken) {
    response.cookies.set("mkx_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60
    });
  }
  return response;
}
