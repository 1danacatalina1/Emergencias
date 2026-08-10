import Link from "next/link";

export function EncabezadoPagina({
  titulo,
  subtitulo,
  claseColor = "bg-primary",
  volverA = "/",
}: {
  titulo: string;
  subtitulo?: string;
  claseColor?: string;
  volverA?: string;
}) {
  return (
    <header className={`${claseColor} px-4 pb-6 pt-6 text-white`}>
      <Link href={volverA} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-white/80">
        ← Volver
      </Link>
      <h1 className="text-xl font-bold">{titulo}</h1>
      {subtitulo && <p className="mt-1 text-sm text-white/80">{subtitulo}</p>}
    </header>
  );
}
