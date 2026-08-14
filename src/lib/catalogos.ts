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
