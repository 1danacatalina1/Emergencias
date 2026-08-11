const COLORES_PRIORIDAD: Record<string, string> = {
  BAJA: "bg-slate-100 text-slate-700",
  MEDIA: "bg-amber-100 text-amber-800",
  ALTA: "bg-orange-100 text-orange-800",
  CRITICA: "bg-red-100 text-red-700",
};

const ETIQUETAS_PRIORIDAD: Record<string, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export function InsigniaPrioridad({ prioridad }: { prioridad: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${COLORES_PRIORIDAD[prioridad] ?? "bg-slate-100 text-slate-700"}`}>
      {ETIQUETAS_PRIORIDAD[prioridad] ?? prioridad}
    </span>
  );
}

const COLORES_ESTADO: Record<string, string> = {
  REPORTADO: "bg-blue-100 text-blue-800",
  EN_ATENCION: "bg-amber-100 text-amber-800",
  EN_PROCESO: "bg-amber-100 text-amber-800",
  RESUELTO: "bg-emerald-100 text-emerald-800",
  CERRADO: "bg-slate-200 text-slate-700",
  DESCARTADO: "bg-slate-200 text-slate-500",
  SOLICITADO: "bg-blue-100 text-blue-800",
  EN_RUTA: "bg-amber-100 text-amber-800",
  TRASLADADO: "bg-emerald-100 text-emerald-800",
  ATENDIDO_EN_CENTRO: "bg-emerald-100 text-emerald-800",
  CANCELADO: "bg-slate-200 text-slate-500",
  SOLICITADA: "bg-blue-100 text-blue-800",
  ENTREGADA: "bg-emerald-100 text-emerald-800",
  DESAPARECIDA: "bg-red-100 text-red-700",
  BUSQUEDA: "bg-orange-100 text-orange-800",
  LOCALIZADA: "bg-emerald-100 text-emerald-800",
  ILESA: "bg-emerald-100 text-emerald-800",
  HERIDA: "bg-orange-100 text-orange-800",
  ATRAPADA: "bg-red-100 text-red-700",
  FALLECIDA: "bg-slate-800 text-white",
  ATENDIDA: "bg-emerald-100 text-emerald-800",
  ACTIVO: "bg-emerald-100 text-emerald-800",
  PAUSADO: "bg-amber-100 text-amber-800",
  OFRECIDA: "bg-blue-100 text-blue-800",
  CONFIRMADA: "bg-amber-100 text-amber-800",
  RECIBIDA: "bg-emerald-100 text-emerald-800",
  CANCELADA: "bg-slate-200 text-slate-500",
};

const ETIQUETAS: Record<string, string> = {
  REPORTADO: "Reportado",
  EN_ATENCION: "En atención",
  EN_PROCESO: "En proceso",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
  DESCARTADO: "Descartado",
  SOLICITADO: "Solicitado",
  EN_RUTA: "En ruta",
  TRASLADADO: "Trasladado",
  ATENDIDO_EN_CENTRO: "Atendido en centro",
  CANCELADO: "Cancelado",
  SOLICITADA: "Solicitada",
  EN_PROCESO_AYUDA: "En proceso",
  ENTREGADA: "Entregada",
  DESAPARECIDA: "Desaparecida",
  BUSQUEDA: "En búsqueda",
  LOCALIZADA: "Localizada",
  ILESA: "Ilesa",
  HERIDA: "Herida",
  ATRAPADA: "Atrapada",
  FALLECIDA: "Fallecida",
  ATENDIDA: "Atendida",
  ACTIVO: "Activo",
  PAUSADO: "Pausado",
  OFRECIDA: "Ofrecida",
  CONFIRMADA: "Confirmada",
  RECIBIDA: "Recibida",
  CANCELADA: "Cancelada",
};

export function InsigniaEstado({ estado }: { estado: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${COLORES_ESTADO[estado] ?? "bg-slate-100 text-slate-700"}`}>
      {ETIQUETAS[estado] ?? estado}
    </span>
  );
}
