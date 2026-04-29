import { NextResponse } from "next/server";
import { safeJson } from "../../../../lib/safe-json";

const authServiceUrl = process.env.AUTH_SERVICE_URL ?? "http://localhost:3001";
const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    fullName?: string;
    storeId?: string;
    whatsappPhone?: string;
  };

  if (!body.email || !body.password || !body.fullName) {
    return NextResponse.json(
      { error: { code: "WEB_AUTH_003", message: "Nombre, email y contrasena son requeridos" } },
      { status: 400 }
    );
  }

  let registerResponse: Response;
  try {
    registerResponse = await fetch(`${authServiceUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        fullName: body.fullName,
        storeId: body.storeId ?? "main-store"
      }),
      cache: "no-store"
    });
  } catch {
    return buildDemoRegisterResponse(body.whatsappPhone);
  }

  const registerResult =
    (await safeJson<{ error?: { code?: string; message?: string } }>(registerResponse)) ?? null;
  if (!registerResponse.ok) {
    if (registerResponse.status >= 500) {
      return buildDemoRegisterResponse(body.whatsappPhone);
    }
    return NextResponse.json(
      {
        error: {
          code: registerResult?.error?.code ?? "WEB_AUTH_004",
          message: registerResult?.error?.message ?? "No se pudo registrar el usuario"
        }
      },
      { status: registerResponse.status || 400 }
    );
  }

  let loginResponse: Response;
  try {
    loginResponse = await fetch(`${authServiceUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store"
    });
  } catch {
    return buildDemoRegisterResponse(body.whatsappPhone);
  }

  const loginResult = (await safeJson<{
    data?: { accessToken?: string; refreshToken?: string };
    error?: { code?: string; message?: string };
  }>(loginResponse)) ?? null;
  if (!loginResponse.ok || !loginResult?.data?.accessToken || !loginResult?.data?.refreshToken) {
    if (loginResponse.status >= 500) {
      return buildDemoRegisterResponse(body.whatsappPhone);
    }
    return NextResponse.json(
      {
        error: {
          code: loginResult?.error?.code ?? "WEB_AUTH_005",
          message: loginResult?.error?.message ?? "Registro creado pero no se pudo iniciar sesion"
        }
      },
      { status: loginResponse.status || 400 }
    );
  }

  const payload = parseJwtPayload(loginResult.data.accessToken);
  const role = typeof payload?.role === "string" ? payload.role : "customer";
  const response = NextResponse.json({ data: { role } });
  response.cookies.set("mkx_access_token", loginResult.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60
  });
  response.cookies.set("mkx_refresh_token", loginResult.data.refreshToken, {
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
  if (body.whatsappPhone) {
    response.cookies.set("mkx_whatsapp_phone", body.whatsappPhone, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
  }
  return response;
}

function buildDemoRegisterResponse(whatsappPhone?: string) {
  const response = NextResponse.json({ data: { role: "customer", fallback: true } });
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
  response.cookies.set("mkx_role", "customer", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  if (whatsappPhone) {
    response.cookies.set("mkx_whatsapp_phone", whatsappPhone, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
  }
  return response;
}
