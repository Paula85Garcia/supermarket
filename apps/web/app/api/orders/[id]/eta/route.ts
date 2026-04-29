import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface EtaRouteProps {
  params: { id: string };
}

export async function GET(_request: Request, { params }: EtaRouteProps) {
  const accessToken = cookies().get("mkx_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: { code: "ORD_AUTH_001", message: "Sesion expirada" } }, { status: 401 });
  }

  const etaMinutes = 22;
  return NextResponse.json({
    data: {
      order_id: params.id,
      eta_minutes: etaMinutes
    }
  });
}
