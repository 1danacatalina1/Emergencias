import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { fileTypeFromBuffer } from "file-type";

export const dynamic = "force-dynamic";

// La extensión del archivo guardado se decide únicamente por el tipo real
// detectado a partir de los primeros bytes (magic number), nunca por el
// nombre ni el Content-Type que envía el navegador, que son fáciles de falsificar.
const MIMES_A_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heic-sequence": "heic",
  "image/heif": "heic",
  "image/heif-sequence": "heic",
};

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

  if (file.size > TAMANO_MAXIMO) {
    return NextResponse.json({ error: "La imagen supera el tamaño máximo (8MB)" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const tipoDetectado = await fileTypeFromBuffer(buffer);
  const extension = tipoDetectado && MIMES_A_EXTENSION[tipoDetectado.mime];

  if (!tipoDetectado || !extension) {
    return NextResponse.json(
      { error: "El archivo no es una imagen válida (jpg, png, webp o heic). No se acepta el formato subido." },
      { status: 400 },
    );
  }

  const nombreUnico = `emergencias/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const blob = await put(nombreUnico, buffer, {
    access: "public",
    contentType: tipoDetectado.mime,
  });

  return NextResponse.json({ url: blob.url });
}
