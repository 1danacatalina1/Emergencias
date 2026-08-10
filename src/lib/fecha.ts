const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/** Formato determinista (evita discrepancias de ICU entre servidor y navegador en hidratación). */
export function formatearFechaHora(fecha: string | Date): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = MESES[d.getMonth()];
  const anio = d.getFullYear();
  const horas24 = d.getHours();
  const horas12 = horas24 % 12 === 0 ? 12 : horas24 % 12;
  const minutos = String(d.getMinutes()).padStart(2, "0");
  const periodo = horas24 < 12 ? "a. m." : "p. m.";
  return `${dia} ${mes} ${anio}, ${horas12}:${minutos} ${periodo}`;
}
