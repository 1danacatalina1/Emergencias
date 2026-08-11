import { del } from "@vercel/blob";

/**
 * Borrado seguro: al eliminar un reporte, sus archivos adjuntos (fotos) también
 * deben desaparecer del almacenamiento, no solo el registro en la base de datos.
 * Es "mejor esfuerzo": si el almacenamiento no está configurado o una URL ya no
 * existe, no debe impedir que se complete la eliminación del reporte.
 */
export async function eliminarArchivos(urls: (string | null | undefined)[]): Promise<void> {
  const validas = urls.filter((u): u is string => Boolean(u));
  if (validas.length === 0 || !process.env.BLOB_READ_WRITE_TOKEN) return;

  try {
    await del(validas);
  } catch (error) {
    console.error("No se pudieron eliminar todos los archivos adjuntos del almacenamiento", error);
  }
}
