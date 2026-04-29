import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeJson } from "../../../../lib/safe-json";

const orderServiceUrl = process.env.ORDER_SERVICE_URL ?? "http://localhost:3004";

interface CreateOrderBody {
  items?: Array<{
    product_id: string;
    name?: string;
    quantity: number;
    unit_price: number;
  }>;
  subtotal?: number;
  delivery_fee?: number;
  total?: number;
}

interface JwtPayload {
  sub?: string;
  store_id?: string;
}

const parseJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as JwtPayload;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  let body: CreateOrderBody | null = null;
  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    body = null;
  }
  if (!body?.items?.length) {
    return NextResponse.json({ error: { code: "WEB_ORDER_001", message: "No hay items para crear el pedido" } }, { status: 400 });
  }

  const accessToken = cookies().get("mkx_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: { code: "WEB_ORDER_002", message: "Sesion no valida" } }, { status: 401 });
  }

  const payload = parseJwtPayload(accessToken);
  const customerId = payload?.sub;
  const storeId = payload?.store_id ?? "main-store";
  if (!customerId) {
    return NextResponse.json({ error: { code: "WEB_ORDER_003", message: "No se pudo identificar el cliente" } }, { status: 401 });
  }

  const response = await fetch(`${orderServiceUrl}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_id: customerId,
      store_id: storeId,
      items: body.items
    }),
    cache: "no-store"
  });

  const result = await safeJson<{ data?: { id?: string }; error?: { message?: string } }>(response);
  if (!response.ok || !result?.data?.id) {
    return NextResponse.json(
      { error: { code: "WEB_ORDER_004", message: result?.error?.message ?? "No se pudo crear el pedido" } },
      { status: response.status || 500 }
    );
  }

  return NextResponse.json({ data: { id: result.data.id } });
}
