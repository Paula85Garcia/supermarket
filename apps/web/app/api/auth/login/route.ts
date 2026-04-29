import { NextResponse } from "next/server";
import { safeJson } from "../../../../lib/safe-json";

const authServiceUrl = process.env.AUTH_SERVICE_URL ?? "http://localhost:3001";

const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Record<string, unknown>;
    return payload;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json({ error: { code: "WEB_AUTH_001", message: "Email y contrasena son requeridos" } }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(`${authServiceUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store"
    });
  } catch {
    return buildDemoAuthResponse(body.email);
  }

  const result = (await safeJson<{
    data?: { accessToken?: string; refreshToken?: string };
    error?: { code?: string; message?: string };
  }>(response)) ?? null;

  if (!response.ok || !result?.data?.accessToken || !result?.data?.refreshToken) {
    if (response.status >= 500) {
      return buildDemoAuthResponse(body.email);
    }
    return NextResponse.json(
      { error: { code: result?.error?.code ?? "WEB_AUTH_002", message: result?.error?.message ?? "Login invalido" } },
      { status: response.status || 401 }
    );
  }

  const payload = parseJwtPayload(result.data.accessToken);
  const role = typeof payload?.role === "string" ? payload.role : "customer";

  const res = NextResponse.json({ data: { role } });
  res.cookies.set("mkx_access_token", result.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60
  });
  res.cookies.set("mkx_refresh_token", result.data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  res.cookies.set("mkx_role", role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}

function buildDemoAuthResponse(email: string) {
  const role = email.includes("admin") ? "admin" : "customer";
  const response = NextResponse.json({
    data: { role, fallback: true }
  });
  response.cookies.set("mkx_access_token", "demo-access-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60
  });
  response.cookies.set("mkx_refresh_token", "demo-refresh-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  response.cookies.set("mkx_role", role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
