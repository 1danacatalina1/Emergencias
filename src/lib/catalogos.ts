export const CANALES_SOLICITUD = [
  { value: "PLATAFORMA", label: "Formulario web", icono: "🌐" },
  { value: "WHATSAPP", label: "WhatsApp", icono: "💬" },
  { value: "LLAMADA", label: "Llamada telefónica", icono: "📞" },
  { value: "PRESENCIAL", label: "Presencial", icono: "🧑‍🤝‍🧑" },
  { value: "OTRO", label: "Otro", icono: "✉️" },
] as const;

export const TIPOS_VEHICULO = [
  { value: "CARRO", label: "Carro particular", icono: "🚗" },
  { value: "CAMIONETA", label: "Camioneta", icono: "🚙" },
  { value: "BUS_BUSETA", label: "Bus / buseta", icono: "🚌" },
  { value: "MOTO", label: "Moto", icono: "🏍️" },
  { value: "CAMION", label: "Camión de carga", icono: "🚚" },
  { value: "OTRO", label: "Otro", icono: "🚐" },
] as const;

export const ESTADOS_VEHICULO = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "EN_USO", label: "En uso" },
  { value: "MANTENIMIENTO", label: "En mantenimiento" },
  { value: "NO_DISPONIBLE", label: "No disponible" },
] as const;

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
  { value: "PROFESIONAL_SALUD", label: "Profesional de la salud" },
  { value: "PROFESIONAL_VETERINARIA", label: "Profesional en veterinaria" },
  { value: "PROFESIONAL_INGENIERIA_ARQUITECTURA", label: "Profesional en ingeniería / arquitectura" },
  { value: "CENTRO_ACOPIO", label: "Centro de acopio de donaciones" },
  { value: "ENTIDAD", label: "Entidad / organización" },
  { value: "OTRO", label: "Otro" },
] as const;

/** Tipos de colaborador que representan una organización, no una persona — no se les pide disponibilidad/experticia individual. */
export const TIPOS_COLABORADOR_ORGANIZACION = ["CENTRO_ACOPIO", "ENTIDAD"];

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
