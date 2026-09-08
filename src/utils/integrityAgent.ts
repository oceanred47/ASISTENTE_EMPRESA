// Agente Especialista en Base de Datos
// Audita la integridad clínica de los expedientes TEA y sugiere/aplica correcciones.
// Motor basado en reglas (sin dependencias externas) para operar de forma local y confiable.

import { IntegrityFinding, TeaRecord, TeaRecordInput } from '../types';
import { calcEtapaVida, isAdult } from './teaHelpers';

const EMPLEO_KEYWORDS = ['Rehabilitación Vocacional', 'Búsqueda de empleo', 'Retención de empleo', 'Capacitación laboral', 'Acomodos razonables'];

export function runIntegrityAudit(records: TeaRecord[]): IntegrityFinding[] {
  const findings: IntegrityFinding[] = [];

  for (const r of records) {
    // 1. Edad vs. Etapa de Vida
    const expectedEtapa = calcEtapaVida(r.edad);
    if (r.etapaVida !== expectedEtapa) {
      findings.push({
        id: `${r.id}-edad_etapa`,
        recordId: r.id,
        category: 'edad_etapa',
        severity: 'critico',
        message: `Edad (${r.edad}) no corresponde con la etapa de vida registrada ("${r.etapaVida}"). Debería ser "${expectedEtapa}".`,
        autoFixable: true,
      });
    }

    // 2. Diagnóstico incompleto para referidos de empleo
    const referidoEmpleo = r.razonesReferido.some((rz) => EMPLEO_KEYWORDS.includes(rz));
    if (referidoEmpleo && r.diagnosticoConfirmado !== 'Sí') {
      findings.push({
        id: `${r.id}-diagnostico_incompleto`,
        recordId: r.id,
        category: 'diagnostico_incompleto',
        severity: 'advertencia',
        message: 'Caso referido a servicios de empleo/Rehabilitación Vocacional sin diagnóstico confirmado. Verificar certificación diagnóstica.',
        autoFixable: false,
      });
    }

    // 3. Falta de datos de contacto en casos activos
    const casoActivo = r.estadoSeguimiento === 'En proceso' || r.estadoSeguimiento === 'Pendiente';
    if (casoActivo && !r.personaContacto) {
      findings.push({
        id: `${r.id}-contacto_faltante`,
        recordId: r.id,
        category: 'contacto_faltante',
        severity: 'advertencia',
        message: 'Expediente activo sin persona de contacto registrada en la agencia referida.',
        autoFixable: false,
      });
    }

    // 4. Seguimiento resuelto sin resultado preliminar documentado
    if (r.estadoSeguimiento === 'Resuelto' && !r.resultadoPreliminar) {
      findings.push({
        id: `${r.id}-seguimiento_incompleto`,
        recordId: r.id,
        category: 'seguimiento_incompleto',
        severity: 'info',
        message: 'Caso marcado como resuelto sin un resultado preliminar/final documentado.',
        autoFixable: false,
      });
    }

    // 5. Datos administrativos faltantes
    const faltantes: string[] = [];
    if (!r.numeroRegistro) faltantes.push('número de registro');
    if (!r.municipio) faltantes.push('municipio');
    if (!r.coordinadorRegional) faltantes.push('coordinador regional');
    if (!r.nombreParticipante) faltantes.push('nombre del participante');
    if (faltantes.length > 0) {
      findings.push({
        id: `${r.id}-datos_faltantes`,
        recordId: r.id,
        category: 'datos_faltantes',
        severity: 'critico',
        message: `Faltan datos administrativos: ${faltantes.join(', ')}.`,
        autoFixable: false,
      });
    }
  }

  return findings;
}

/** Returns the patch needed to auto-fix a single finding, or null if it cannot be auto-fixed. */
export function computeAutoFixPatch(finding: IntegrityFinding, record: TeaRecord): Partial<TeaRecordInput> | null {
  if (!finding.autoFixable) return null;
  if (finding.category === 'edad_etapa') {
    return { etapaVida: calcEtapaVida(record.edad) };
  }
  return null;
}

export interface AuditSummary {
  total: number;
  critico: number;
  advertencia: number;
  info: number;
  affectedRecords: number;
  healthPercent: number;
}

export function summarizeAudit(findings: IntegrityFinding[], totalRecords: number): AuditSummary {
  const critico = findings.filter((f) => f.severity === 'critico').length;
  const advertencia = findings.filter((f) => f.severity === 'advertencia').length;
  const info = findings.filter((f) => f.severity === 'info').length;
  const affectedRecords = new Set(findings.map((f) => f.recordId)).size;
  const healthPercent = totalRecords === 0 ? 100 : Math.max(0, Math.round(100 - (affectedRecords / totalRecords) * 100));
  return { total: findings.length, critico, advertencia, info, affectedRecords, healthPercent };
}

/**
 * Motor de consultas en lenguaje natural, basado en coincidencia de palabras clave
 * sobre los datos locales. No depende de un servicio externo de IA.
 */
export function answerLocalQuery(query: string, records: TeaRecord[]): string {
  const q = query.toLowerCase();

  const count = (pred: (r: TeaRecord) => boolean) => records.filter(pred).length;

  if (/(cu[aá]nt[oa]s?).*(adult)/.test(q) || /adults?.*(count|how many)/.test(q)) {
    return `Hay ${count((r) => isAdult(r.edad))} expedientes de personas adultas (18 años o más) con TEA.`;
  }
  if (/(cu[aá]nt[oa]s?).*(resuelt|resolved)/.test(q)) {
    return `${count((r) => r.estadoSeguimiento === 'Resuelto')} expedientes están marcados como Resueltos.`;
  }
  if (/(cu[aá]nt[oa]s?).*(pendient|pending)/.test(q)) {
    return `${count((r) => r.estadoSeguimiento === 'Pendiente')} expedientes están Pendientes.`;
  }
  if (/(cu[aá]nt[oa]s?).*(proceso|in process)/.test(q)) {
    return `${count((r) => r.estadoSeguimiento === 'En proceso')} expedientes están En proceso.`;
  }
  if (/(cu[aá]nt[oa]s?).*(no localizad|not located)/.test(q)) {
    return `${count((r) => r.estadoSeguimiento === 'No localizado')} expedientes están marcados como No localizado.`;
  }
  if (/(cu[aá]nt[oa]s?|total|how many)/.test(q)) {
    return `La base de datos contiene actualmente ${records.length} expedientes registrados.`;
  }
  if (/regi[oó]n/.test(q) || /region/.test(q)) {
    const byRegion = new Map<string, number>();
    records.forEach((r) => byRegion.set(r.region, (byRegion.get(r.region) ?? 0) + 1));
    const lines = Array.from(byRegion.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([region, n]) => `${region}: ${n}`)
      .join(', ');
    return `Distribución por región — ${lines}.`;
  }
  if (/barrera|barrier/.test(q)) {
    const byBarrera = new Map<string, number>();
    records.forEach((r) => r.barreras.forEach((b) => byBarrera.set(b, (byBarrera.get(b) ?? 0) + 1)));
    const top = Array.from(byBarrera.entries()).sort((a, b) => b[1] - a[1])[0];
    if (!top) return 'No hay barreras registradas en la base de datos.';
    return `La barrera más reportada es "${top[0]}", presente en ${top[1]} expediente(s).`;
  }

  return 'No pude interpretar la consulta con el motor local. Intenta preguntar por totales, estado de seguimiento, adultos, región o barreras.';
}
