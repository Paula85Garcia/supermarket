import { createHash } from "crypto";
import { NextResponse } from "next/server";

const cloudName = "dky2dscgr";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const folder = (form.get("folder") as string | null) ?? "merkamax/products";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: { code: "UPL_001", message: "Archivo requerido" } }, { status: 400 });
  }

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: { code: "UPL_002", message: "Configura CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET" } },
      { status: 500 }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signaturePayload).digest("hex");

  const cloudinaryForm = new FormData();
  cloudinaryForm.append("file", file);
  cloudinaryForm.append("api_key", apiKey);
  cloudinaryForm.append("timestamp", String(timestamp));
  cloudinaryForm.append("signature", signature);
  cloudinaryForm.append("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: cloudinaryForm
  });
  const result = (await response.json()) as { secure_url?: string; public_id?: string; error?: { message?: string } };

  if (!response.ok || !result.secure_url) {
    return NextResponse.json(
      { error: { code: "UPL_003", message: result.error?.message ?? "Error subiendo a Cloudinary" } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { secure_url: result.secure_url, public_id: result.public_id, folder } });
}
