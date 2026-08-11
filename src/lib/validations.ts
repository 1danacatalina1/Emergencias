import { z } from "zod";

export const nivelPrioridadEnum = z.enum(["BAJA", "MEDIA", "ALTA", "CRITICA"]);
export const estadoIncidenteEnum = z.enum([
  "REPORTADO",
  "EN_ATENCION",
  "EN_PROCESO",
  "RESUELTO",
  "CERRADO",
  "DESCARTADO",
]);
export const tipoDocumentoEnum = z.enum([
  "CC",
  "TI",
  "CE",
  "PASAPORTE",
  "RC",
  "NUIP",
  "SIN_DOCUMENTO",
]);
export const sexoEnum = z.enum(["MASCULINO", "FEMENINO", "OTRO", "NO_INFORMA"]);
export const estadoPersonaEnum = z.enum([
  "DESAPARECIDA",
  "BUSQUEDA",
  "LOCALIZADA",
  "ILESA",
  "HERIDA",
  "ATRAPADA",
  "TRASLADADA",
  "FALLECIDA",
  "ATENDIDA",
]);
export const tipoTrasladoEnum = z.enum([
  "AMBULANCIA",
  "VEHICULO_PARTICULAR",
  "HELICOPTERO",
  "A_PIE",
  "OTRO",
]);
export const estadoTrasladoEnum = z.enum([
  "SOLICITADO",
  "EN_RUTA",
  "TRASLADADO",
  "ATENDIDO_EN_CENTRO",
  "CANCELADO",
]);
export const tipoAyudaEnum = z.enum([
  "ALIMENTOS",
  "AGUA",
  "REFUGIO_ALOJAMIENTO",
  "MEDICAMENTOS",
  "ATENCION_MEDICA",
  "ROPA_ABRIGO",
  "RESCATE",
  "ELEMENTOS_ASEO",
  "OTRO",
]);
export const estadoAyudaEnum = z.enum([
  "SOLICITADA",
  "EN_PROCESO",
  "ENTREGADA",
  "CANCELADA",
]);

const ubicacionSchema = z.object({
  direccion: z.string().min(3, "La dirección es obligatoria"),
  municipio: z.string().min(2, "El municipio es obligatorio"),
  departamento: z.string().min(2, "El departamento es obligatorio"),
  latitud: z.coerce.number().min(-90).max(90),
  longitud: z.coerce.number().min(-180).max(180),
  precisionUbicacion: z.coerce.number().optional().nullable(),
});

export const personaInlineSchema = z.object({
  nombreCompleto: z.string().min(3, "El nombre es obligatorio"),
  tipoDocumento: tipoDocumentoEnum.default("SIN_DOCUMENTO"),
  numeroDocumento: z.string().optional().nullable(),
  edad: z.coerce.number().int().min(0).max(130).optional().nullable(),
  sexo: sexoEnum.default("NO_INFORMA"),
  telefono: z.string().optional().nullable(),
  estadoPersona: estadoPersonaEnum.default("DESAPARECIDA"),
  condicionSalud: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});

// Reportar emergencia (público)
export const incidentCreateSchema = z
  .object({
    incidentTypeId: z.string().min(1, "Selecciona el tipo de emergencia"),
    subtipo: z.string().optional().nullable(),
    descripcion: z.string().min(10, "Describe la emergencia con más detalle"),
    nivelPrioridad: nivelPrioridadEnum.default("MEDIA"),
    fechaEvento: z.coerce.date().optional(),
    reporteroNombre: z.string().optional().nullable(),
    reporteroTelefono: z.string().optional().nullable(),
    esAnonimo: z.boolean().default(false),
    personas: z.array(personaInlineSchema).default([]),
    fotos: z.array(z.string().url()).default([]),
  })
  .merge(ubicacionSchema);

export const incidentUpdateSchema = z.object({
  incidentTypeId: z.string().min(1).optional(),
  subtipo: z.string().optional().nullable(),
  descripcion: z.string().min(10).optional(),
  direccion: z.string().min(3).optional(),
  municipio: z.string().min(2).optional(),
  departamento: z.string().min(2).optional(),
  latitud: z.coerce.number().min(-90).max(90).optional(),
  longitud: z.coerce.number().min(-180).max(180).optional(),
  precisionUbicacion: z.coerce.number().optional().nullable(),
  nivelPrioridad: nivelPrioridadEnum.optional(),
  estado: estadoIncidenteEnum.optional(),
  fechaEvento: z.coerce.date().optional(),
});

export const personCreateSchema = personaInlineSchema.extend({
  incidentId: z.string().min(1, "Selecciona el incidente asociado"),
  fechaNacimiento: z.coerce.date().optional().nullable(),
  direccionResidencia: z.string().optional().nullable(),
  contactoNombre: z.string().optional().nullable(),
  contactoTelefono: z.string().optional().nullable(),
  contactoParentesco: z.string().optional().nullable(),
});

export const personUpdateSchema = personCreateSchema.partial().extend({
  incidentId: z.string().min(1).optional(),
});

// Reportar traslado (público) — puede referenciar un incidente existente o crear uno nuevo
export const transferCreateSchema = z
  .object({
    incidentId: z.string().optional().nullable(),
    personId: z.string().optional().nullable(),
    persona: personaInlineSchema.partial().optional(),
    centroMedico: z.string().min(2, "Indica el centro médico"),
    tipoTraslado: tipoTrasladoEnum.default("AMBULANCIA"),
    motivo: z.string().min(3, "Indica el motivo del traslado"),
    vehiculoPlaca: z.string().optional().nullable(),
    responsable: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
    reporteroNombre: z.string().optional().nullable(),
    reporteroTelefono: z.string().optional().nullable(),
  })
  .merge(ubicacionSchema.partial())
  .superRefine((data, ctx) => {
    if (!data.personId && !data.persona?.nombreCompleto) {
      ctx.addIssue({
        code: "custom",
        path: ["persona", "nombreCompleto"],
        message: "Indica el nombre de la persona trasladada",
      });
    }
    if (!data.incidentId) {
      if (!data.direccion || !data.municipio || !data.departamento) {
        ctx.addIssue({
          code: "custom",
          path: ["direccion"],
          message: "Indica la ubicación del traslado",
        });
      }
      if (data.latitud === undefined || data.longitud === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["latitud"],
          message: "Selecciona la ubicación en el mapa",
        });
      }
    }
  });

export const transferUpdateSchema = z.object({
  centroMedico: z.string().min(2).optional(),
  tipoTraslado: tipoTrasladoEnum.optional(),
  motivo: z.string().min(3).optional(),
  estadoTraslado: estadoTrasladoEnum.optional(),
  vehiculoPlaca: z.string().optional().nullable(),
  responsable: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  fechaTraslado: z.coerce.date().optional(),
});

// Solicitar ayuda humanitaria (público)
export const aidRequestCreateSchema = z.object({
  incidentId: z.string().optional().nullable(),
  nombreSolicitante: z.string().min(3, "Indica tu nombre completo"),
  telefonoSolicitante: z.string().min(7, "Indica un teléfono de contacto"),
  tipoAyuda: tipoAyudaEnum.default("OTRO"),
  descripcion: z.string().min(5, "Describe la ayuda que necesitas"),
  cantidadPersonas: z.coerce.number().int().min(1).default(1),
  prioridad: nivelPrioridadEnum.default("MEDIA"),
  direccion: z.string().min(3, "La dirección es obligatoria"),
  municipio: z.string().min(2, "El municipio es obligatorio"),
  departamento: z.string().min(2, "El departamento es obligatorio"),
  latitud: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitud: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export const aidRequestUpdateSchema = z.object({
  tipoAyuda: tipoAyudaEnum.optional(),
  descripcion: z.string().min(5).optional(),
  cantidadPersonas: z.coerce.number().int().min(1).optional(),
  prioridad: nivelPrioridadEnum.optional(),
  estado: estadoAyudaEnum.optional(),
  direccion: z.string().min(3).optional(),
  municipio: z.string().min(2).optional(),
  departamento: z.string().min(2).optional(),
  latitud: z.coerce.number().optional().nullable(),
  longitud: z.coerce.number().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  totpCode: z.string().optional(),
});

export const totpVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, "El código debe tener 6 dígitos"),
});

export const totpDisableSchema = z.object({
  password: z.string().min(1, "Ingresa tu contraseña actual"),
});

// Puntos de acopio de donaciones (público)
export const estadoPuntoAcopioEnum = z.enum(["ACTIVO", "PAUSADO", "CERRADO"]);

export const donationPointCreateSchema = z.object({
  nombre: z.string().min(3, "Indica el nombre del punto de acopio"),
  descripcion: z.string().optional().nullable(),
  tiposAceptados: z.array(tipoAyudaEnum).min(1, "Selecciona al menos un tipo de donación"),
  direccion: z.string().min(3, "La dirección es obligatoria"),
  municipio: z.string().min(2, "El municipio es obligatorio"),
  departamento: z.string().min(2, "El departamento es obligatorio"),
  latitud: z.coerce.number().min(-90).max(90),
  longitud: z.coerce.number().min(-180).max(180),
  responsable: z.string().optional().nullable(),
  telefonoContacto: z.string().min(7, "Indica un teléfono de contacto"),
  horario: z.string().optional().nullable(),
});

export const donationPointUpdateSchema = z.object({
  nombre: z.string().min(3).optional(),
  descripcion: z.string().optional().nullable(),
  tiposAceptados: z.array(tipoAyudaEnum).min(1).optional(),
  direccion: z.string().min(3).optional(),
  municipio: z.string().min(2).optional(),
  departamento: z.string().min(2).optional(),
  latitud: z.coerce.number().min(-90).max(90).optional(),
  longitud: z.coerce.number().min(-180).max(180).optional(),
  responsable: z.string().optional().nullable(),
  telefonoContacto: z.string().min(7).optional(),
  horario: z.string().optional().nullable(),
  estado: estadoPuntoAcopioEnum.optional(),
});

// Donaciones ofrecidas (público)
export const estadoDonacionEnum = z.enum(["OFRECIDA", "CONFIRMADA", "RECIBIDA", "CANCELADA"]);

export const donationCreateSchema = z.object({
  donationPointId: z.string().optional().nullable(),
  nombreDonante: z.string().min(3, "Indica tu nombre completo"),
  telefonoDonante: z.string().min(7, "Indica un teléfono de contacto"),
  tipoAyuda: tipoAyudaEnum.default("OTRO"),
  descripcion: z.string().min(5, "Describe qué quieres donar (tipo y cantidad)"),
  direccion: z.string().optional().nullable(),
  municipio: z.string().min(2, "El municipio es obligatorio"),
  departamento: z.string().min(2, "El departamento es obligatorio"),
  latitud: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitud: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export const donationUpdateSchema = z.object({
  tipoAyuda: tipoAyudaEnum.optional(),
  descripcion: z.string().min(5).optional(),
  estado: estadoDonacionEnum.optional(),
  donationPointId: z.string().optional().nullable(),
});

// Reportar persona desaparecida (público)
export const missingPersonCreateSchema = z.object({
  incidentId: z.string().optional().nullable(),
  nombreCompleto: z.string().min(3, "Indica el nombre completo de la persona"),
  tipoDocumento: tipoDocumentoEnum.default("SIN_DOCUMENTO"),
  numeroDocumento: z.string().optional().nullable(),
  edad: z.coerce.number().int().min(0).max(130).optional().nullable(),
  sexo: sexoEnum.default("NO_INFORMA"),
  descripcionFisica: z.string().optional().nullable(),
  fechaVisto: z.coerce.date().optional(),

  direccion: z.string().min(3, "Indica dónde fue visto por última vez"),
  municipio: z.string().min(2, "El municipio es obligatorio"),
  departamento: z.string().min(2, "El departamento es obligatorio"),
  latitud: z.coerce.number().min(-90).max(90),
  longitud: z.coerce.number().min(-180).max(180),

  contactoNombre: z.string().min(3, "Indica el nombre de la persona de contacto"),
  contactoTelefono: z.string().min(7, "Indica un teléfono de contacto"),
  contactoParentesco: z.string().optional().nullable(),

  foto: z.string().url().optional().nullable(),
});

// Mascotas perdidas / encontradas (público)
export const tipoReporteMascotaEnum = z.enum(["PERDIDA", "ENCONTRADA"]);
export const especieMascotaEnum = z.enum(["PERRO", "GATO", "AVE", "OTRO"]);
export const estadoMascotaEnum = z.enum(["ACTIVO", "REUNIDO", "CERRADO"]);

export const petCreateSchema = z.object({
  tipo: tipoReporteMascotaEnum,
  especie: especieMascotaEnum.default("OTRO"),
  nombre: z.string().optional().nullable(),
  raza: z.string().optional().nullable(),
  descripcion: z.string().min(5, "Describe la mascota: color, tamaño, señas particulares"),
  fecha: z.coerce.date().optional(),

  direccion: z.string().min(3, "Indica la dirección"),
  municipio: z.string().min(2, "El municipio es obligatorio"),
  departamento: z.string().min(2, "El departamento es obligatorio"),
  latitud: z.coerce.number().min(-90).max(90),
  longitud: z.coerce.number().min(-180).max(180),

  contactoNombre: z.string().min(3, "Indica tu nombre"),
  contactoTelefono: z.string().min(7, "Indica un teléfono de contacto"),

  fotoUrl: z.string().url().optional().nullable(),
});

export const petUpdateSchema = z.object({
  especie: especieMascotaEnum.optional(),
  nombre: z.string().optional().nullable(),
  raza: z.string().optional().nullable(),
  descripcion: z.string().min(5).optional(),
  estado: estadoMascotaEnum.optional(),
});
