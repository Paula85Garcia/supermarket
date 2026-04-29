import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/orders", "/account", "/checkout"];
const adminRoutes = ["/admin"];
const driverRoutes = ["/driver"];
const pickerRoutes = ["/picker"];
const authRoutes = ["/login", "/register"];
const authServiceUrl = process.env.AUTH_SERVICE_URL ?? "http://localhost:3001";

const startsWithAny = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const jwtAccess = request.cookies.get("mkx_access_token")?.value;
  const operativeToken = request.cookies.get("mkx_token")?.value;
  const sessionForProtected = jwtAccess ?? operativeToken;
  const refreshToken = request.cookies.get("mkx_refresh_token")?.value;
  const role = request.cookies.get("mkx_role")?.value ?? "";

  const isProtected =
    startsWithAny(pathname, protectedRoutes) ||
    startsWithAny(pathname, adminRoutes) ||
    startsWithAny(pathname, driverRoutes) ||
    startsWithAny(pathname, pickerRoutes);

  if (!jwtAccess && isProtected && refreshToken) {
    const refreshResponse = await fetch(`${authServiceUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store"
    });
    const refreshResult = (await refreshResponse.json()) as { data?: { accessToken?: string } };
    if (refreshResponse.ok && refreshResult.data?.accessToken) {
      const response = NextResponse.next();
      response.cookies.set("mkx_access_token", refreshResult.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60
      });
      return response;
    }
  }

  if (!sessionForProtected && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((jwtAccess || operativeToken) && startsWithAny(pathname, authRoutes)) {
    if (operativeToken && role === "picker") {
      return NextResponse.redirect(new URL("/picker", request.url));
    }
    if (operativeToken && role === "driver") {
      return NextResponse.redirect(new URL("/driver", request.url));
    }
    if (operativeToken && role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (startsWithAny(pathname, adminRoutes) && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (startsWithAny(pathname, driverRoutes) && role !== "driver") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (startsWithAny(pathname, pickerRoutes) && role !== "picker") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders/:path*", "/account/:path*", "/checkout/:path*", "/admin/:path*", "/driver/:path*", "/picker/:path*", "/login", "/register"]
};
