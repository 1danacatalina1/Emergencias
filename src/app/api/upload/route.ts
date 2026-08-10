import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const TAMANO_MAXIMO = 8 * 1024 * 1024; // 8MB

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "El almacenamiento de archivos no está configurado (BLOB_READ_WRITE_TOKEN)" },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo no válido" }, { status: 400 });
  }

  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return NextResponse.json({ error: "Formato de imagen no permitido" }, { status: 400 });
  }

  if (file.size > TAMANO_MAXIMO) {
    return NextResponse.json({ error: "La imagen supera el tamaño máximo (8MB)" }, { status: 400 });
  }

  const nombreUnico = `emergencias/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
  const blob = await put(nombreUnico, file, { access: "public" });

  return NextResponse.json({ url: blob.url });
}
