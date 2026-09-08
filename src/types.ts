// Tipos del Registro de Coordinación Interinstitucional de Servicios TEA
// Departamento de la Familia — Ley Núm. 163 de 13 de agosto de 2024

export type Sexo = 'Femenino' | 'Masculino' | 'Otro' | 'Prefiere no contestar';

export type DiagnosticoConfirmado = 'Sí' | 'No' | 'En evaluación';

export type NivelApoyo = 'Nivel 1' | 'Nivel 2' | 'Nivel 3' | 'Desconocido';

export type EtapaVida =
  | '0-2' // Intervención Temprana
  | '3-5' // Preescolar
  | '6-12' // Edad Escolar
  | '13-17' // Adolescencia
  | '18-21' // Transición a la Vida Adulta
  | '22-30'
  | '31-40'
  | '41-50'
  | '51-60'
  | '60+';

export type MedioEntrada =
  | 'Línea de Orientación'
  | 'Familia'
  | 'Persona con TEA'
  | 'Departamento de Salud'
  | 'Departamento de Educación'
  | 'ACUDEN'
  | 'ADFAN'
  | 'ADSEF'
  | 'ASUME'
  | 'Rehabilitación Vocacional'
  | 'Departamento del Trabajo'
  | 'Municipio'
  | 'Organización Comunitaria'
  | 'Otro';

export type Convivencia =
  | 'Padre'
  | 'Madre'
  | 'Ambos padres'
  | 'Tutor'
  | 'Familiar'
  | 'Cónyuge/Pareja'
  | 'Independiente'
  | 'Hogar asistido'
  | 'Otro';

export type EstadoSeguimiento = 'Resuelto' | 'En proceso' | 'Pendiente' | 'No localizado' | 'Cerrado';

export type TiempoRespuesta = 'Menos de 30 días' | '31 a 60 días' | '61 a 90 días' | 'Más de 90 días';

export const REGIONES = [
  'San Juan',
  'Bayamón',
  'Arecibo',
  'Mayagüez',
  'Ponce',
  'Caguas',
  'Humacao',
] as const;
export type Region = (typeof REGIONES)[number];

export const RAZONES_REFERIDO = {
  salud: ['Diagnóstico', 'Psiquiatría', 'Psicología', 'Terapias', 'Medicamentos', 'Manejo de crisis'],
  educacion: [
    'Intervención temprana',
    'Educación Especial',
    'PEI',
    'Transición escolar',
    'Universidad',
    'Estudios técnicos',
    'Capacitación',
  ],
  cuidadoInfantil: ['Head Start', 'Early Head Start', 'Servicios ACUDEN', 'Cuido especializado', 'Preparación escolar'],
  empleo: ['Rehabilitación Vocacional', 'Capacitación laboral', 'Búsqueda de empleo', 'Retención de empleo', 'Acomodos razonables'],
  beneficios: ['PAN', 'Medicaid', 'Seguro Social', 'ASUME', 'Servicios ADSEF', 'Otro'],
  vivienda: ['Vivienda independiente', 'Vivienda asistida', 'Subsidios', 'Adaptaciones'],
  apoyoFamiliar: ['Respiro', 'Grupos de apoyo', 'Orientación', 'Capacitación familiar', 'Recreación', 'Transportación', 'Inclusión comunitaria'],
} as const;

export const NECESIDADES = [
  'Comunicación',
  'Conducta',
  'Vida independiente',
  'Educación',
  'Empleo',
  'Salud mental',
  'Salud física',
  'Vivienda',
  'Transportación',
  'Seguridad',
  'Apoyo familiar',
  'Servicios especializados',
  'Otro',
] as const;

export const AGENCIAS_GESTION = [
  'Salud',
  'Educación',
  'ACUDEN',
  'ADFAN',
  'ADSEF',
  'ASUME',
  'ASSMCA',
  'Rehabilitación Vocacional',
  'Departamento del Trabajo',
  'Vivienda',
  'Municipio',
  'Organización Comunitaria',
  'Otro',
] as const;

export const BARRERAS = [
  'No existen servicios disponibles',
  'Lista de espera',
  'Falta de transportación',
  'Falta de información',
  'Problemas de elegibilidad',
  'Falta de personal',
  'Falta de coordinación interagencial',
  'Cubierta médica insuficiente',
  'Barreras económicas',
  'Barreras geográficas',
  'Otro',
] as const;

export interface RecordHistoryEntry {
  id: string;
  date: string; // ISO
  author: string;
  role: string;
  title: string;
  details?: string;
  fields?: string[];
}

export interface TeaRecord {
  id: string;

  // I. Información General
  numeroRegistro: string;
  fechaReferido: string; // ISO date
  region: Region;
  municipio: string;
  coordinadorRegional: string;
  medioEntrada: MedioEntrada;

  // II. Perfil de la persona con TEA
  nombreParticipante: string;
  edad: number;
  sexo: Sexo;
  diagnosticoConfirmado: DiagnosticoConfirmado;
  nivelApoyo: NivelApoyo;

  // III. Etapa de vida (calculada, pero editable)
  etapaVida: EtapaVida;

  // IV. Composición familiar y red de apoyo
  convivencia: Convivencia;

  // V. Razón principal del referido
  razonesReferido: string[];

  // VI. Necesidades identificadas
  necesidades: string[];

  // VII. Gestión realizada
  agenciasGestion: string[];
  fechaGestion?: string;
  personaContacto?: string;
  resultadoPreliminar?: string;

  // VIII. Seguimiento
  estadoSeguimiento: EstadoSeguimiento;
  tiempoRespuesta?: TiempoRespuesta;

  // IX. Barreras identificadas
  barreras: string[];

  // Observaciones
  observaciones?: string;

  // Comité Ley 163-2024 (Art. 10 / Art. 20)
  subcomiteAdultos?: string;

  // Metadatos
  createdAt: string;
  updatedAt: string;
  history: RecordHistoryEntry[];
}

export type TeaRecordInput = Omit<TeaRecord, 'id' | 'createdAt' | 'updatedAt' | 'history'>;

// Roles del sistema (control de acceso)
export const ROLES = ['Administrador', 'Director', 'Supervisor', 'Coordinador'] as const;
export type Role = (typeof ROLES)[number];

export interface RolePermissions {
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
  verAnalitica: boolean;
  usarAgente: boolean;
  aplicarCorrecciones: boolean;
  importarExportar: boolean;
  reiniciarBaseDatos: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  Administrador: {
    crear: true,
    editar: true,
    eliminar: true,
    verAnalitica: true,
    usarAgente: true,
    aplicarCorrecciones: true,
    importarExportar: true,
    reiniciarBaseDatos: true,
  },
  Director: {
    crear: true,
    editar: true,
    eliminar: true,
    verAnalitica: true,
    usarAgente: true,
    aplicarCorrecciones: true,
    importarExportar: true,
    reiniciarBaseDatos: false,
  },
  Supervisor: {
    crear: true,
    editar: true,
    eliminar: false,
    verAnalitica: true,
    usarAgente: true,
    aplicarCorrecciones: true,
    importarExportar: true,
    reiniciarBaseDatos: false,
  },
  Coordinador: {
    crear: true,
    editar: true,
    eliminar: false,
    verAnalitica: true,
    usarAgente: false,
    aplicarCorrecciones: false,
    importarExportar: false,
    reiniciarBaseDatos: false,
  },
};

// Comités Interinstitucionales Ley 163-2024
export const SUBCOMITES_ADULTOS = [
  'Orientación y Sensibilización',
  'Seguimiento y Evaluación de Servicios',
  'Intercesión Legal y Protección',
  'Apoderamiento e Inclusión Comunitaria',
  'Programas de Respiro Familiar',
  'Cuidado Prolongado Especializado',
  'Ama de Llaves',
  'Apoyo Psicológico y Salud Mental',
  'Programas de Cuido Diurno y Vida Independiente',
] as const;

export interface IntegrityFinding {
  id: string;
  recordId: string;
  category: 'edad_etapa' | 'diagnostico_incompleto' | 'contacto_faltante' | 'seguimiento_incompleto' | 'datos_faltantes';
  severity: 'critico' | 'advertencia' | 'info';
  message: string;
  autoFixable: boolean;
}
