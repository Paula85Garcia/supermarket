import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ data: { success: true } });
  response.cookies.set("mkx_access_token", "", { path: "/", maxAge: 0 });
  response.cookies.set("mkx_refresh_token", "", { path: "/", maxAge: 0 });
  response.cookies.set("mkx_role", "", { path: "/", maxAge: 0 });
  response.cookies.set("mkx_token", "", { path: "/", maxAge: 0 });
  return response;
}
