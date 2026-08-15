import { NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import { auth } from "@/lib/auth";
import { esAdministrador } from "@/lib/permisos";

export const dynamic = "force-dynamic";

const TAMANO_MAXIMO = 8 * 1024 * 1024; // 8MB
const MIMES_PERMITIDOS: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
};

const PROMPT = `Eres un asistente que ayuda a un equipo de voluntarios de emergencias en Colombia a registrar vehículos disponibles para movilizar personal o llevar insumos a puntos de acopio.

Te muestro una imagen relacionada con un vehículo (puede ser una foto del vehículo, de su tarjeta de propiedad, de la placa, o una captura de un chat donde alguien lo ofrece). Lee la información visible y responde ÚNICAMENTE con un objeto JSON (sin texto adicional, sin bloque de código markdown) con exactamente estas claves:

{
  "placa": string o null (placa del vehículo, si aparece),
  "tipo": uno de "CARRO", "CAMIONETA", "BUS_BUSETA", "MOTO", "CAMION", "OTRO", o null si no es claro,
  "marcaModelo": string o null (ej. "Toyota Hilux 2018"),
  "capacidadPersonas": number o null,
  "capacidadCargaDescripcion": string o null (ej. "500 kg"),
  "paraPersonas": boolean o null (si el vehículo se ofrece para movilizar personas),
  "paraInsumos": boolean o null (si el vehículo se ofrece para llevar insumos/carga),
  "cubreRutaNacional": boolean o null (si se menciona cobertura entre ciudades),
  "cubreRutaUrbana": boolean o null (si se menciona cobertura dentro de una ciudad),
  "rutasCubiertas": string o null (rutas específicas mencionadas, ej. "Bogotá - Cali"),
  "municipioBase": string o null,
  "departamentoBase": string o null
}

No inventes datos que no estén en la imagen: usa null cuando no aparezcan. No incluyas información de conductores ni de personas: eso se registra por separado.`;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!esAdministrador(session.user.role)) {
    return NextResponse.json(
      { error: "Solo el Administrador puede usar la extracción automática de capturas" },
      { status: 403 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "La extracción automática de capturas no está configurada todavía (falta ANTHROPIC_API_KEY)." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Imagen no válida" }, { status: 400 });
  }
  if (file.size > TAMANO_MAXIMO) {
    return NextResponse.json({ error: "La imagen supera el tamaño máximo (8MB)" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const tipoDetectado = await fileTypeFromBuffer(buffer);
  const mimePermitido = tipoDetectado && MIMES_PERMITIDOS[tipoDetectado.mime];
  if (!tipoDetectado || !mimePermitido) {
    return NextResponse.json({ error: "El archivo no es una imagen válida (jpg, png o webp)." }, { status: 400 });
  }

  const base64 = buffer.toString("base64");

  let respuestaIA: Response;
  try {
    respuestaIA = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mimePermitido, data: base64 } },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Error de conexión con la API de extracción de capturas:", error);
    return NextResponse.json({ error: "No se pudo contactar el servicio de extracción. Intenta de nuevo." }, { status: 502 });
  }

  if (!respuestaIA.ok) {
    const detalle = await respuestaIA.text().catch(() => "");
    console.error("Error de la API de extracción de capturas:", respuestaIA.status, detalle);
    return NextResponse.json(
      { error: "El servicio de extracción no pudo procesar la captura. Intenta de nuevo o regístralo a mano." },
      { status: 502 },
    );
  }

  const data = await respuestaIA.json();
  const texto = data?.content?.[0]?.text ?? "";

  let extraido: Record<string, unknown>;
  try {
    const limpio = String(texto).trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
    extraido = JSON.parse(limpio);
  } catch (error) {
    console.error("No se pudo interpretar la respuesta de la extracción:", texto, error);
    return NextResponse.json(
      { error: "No se pudo interpretar la información extraída. Intenta con otra captura o regístralo a mano." },
      { status: 502 },
    );
  }

  return NextResponse.json(extraido);
}
