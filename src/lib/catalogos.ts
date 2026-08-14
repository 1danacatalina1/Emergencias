export const TIPOS_AYUDA = [
  { value: "ALIMENTOS", label: "Alimentos" },
  { value: "AGUA", label: "Agua potable" },
  { value: "REFUGIO_ALOJAMIENTO", label: "Refugio / alojamiento" },
  { value: "MEDICAMENTOS", label: "Medicamentos" },
  { value: "ATENCION_MEDICA", label: "Atención médica" },
  { value: "ROPA_ABRIGO", label: "Ropa / abrigo" },
  { value: "RESCATE", label: "Rescate" },
  { value: "ELEMENTOS_ASEO", label: "Elementos de aseo" },
  { value: "OTRO", label: "Otro" },
] as const;

export const TIPOS_COLABORADOR = [
  { value: "RESCATISTA", label: "Rescatista" },
  { value: "VOLUNTARIO", label: "Voluntario" },
  { value: "COORDINADOR_VOLUNTARIOS", label: "Coordinador de voluntarios" },
  { value: "CENTRO_ACOPIO", label: "Centro de acopio de donaciones" },
  { value: "ENTIDAD", label: "Entidad / organización" },
  { value: "OTRO", label: "Otro" },
] as const;

/** Sugerencias para el campo de insumo al registrar un envío — no restringen: se puede escribir cualquier otro. */
export const INSUMOS_SUGERIDOS = [
  "Agua embotellada",
  "Arroz",
  "Aceite",
  "Panela",
  "Atún enlatado",
  "Leche en polvo",
  "Pañales desechables",
  "Toallas higiénicas",
  "Kits de aseo personal",
  "Cobijas",
  "Colchonetas",
  "Ropa de abrigo",
  "Botiquín / medicamentos básicos",
  "Suero oral",
  "Linternas",
  "Pilas",
  "Velas",
  "Carpas / toldillos",
];

/** Sugerencias para el campo de unidad de medida al registrar un envío. */
export const UNIDADES_SUGERIDAS = ["unidades", "kg", "litros", "cajas", "bultos", "paquetes"];
