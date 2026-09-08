// Monitor de plazos reglamentarios — Ley Núm. 163 de 13 de agosto de 2024
import { TeaRecord } from '../types';
import { daysSince, isAdult } from './teaHelpers';

export function isAdultsCommitteeEligible(record: TeaRecord): boolean {
  return isAdult(record.edad) || record.etapaVida === '18-21';
}

export interface ProvisionalCoverageStatus {
  applicable: boolean;
  days: number;
  level: 'ok' | 'warning' | 'urgent' | 'expired';
}

/** Art. 22 — Cubierta Especial Provisional: 180 días máximo para evaluación diagnóstica. */
export function provisionalCoverageStatus(record: TeaRecord): ProvisionalCoverageStatus {
  if (record.diagnosticoConfirmado !== 'En evaluación') {
    return { applicable: false, days: 0, level: 'ok' };
  }
  const days = daysSince(record.fechaReferido);
  let level: ProvisionalCoverageStatus['level'] = 'ok';
  if (days >= 180) level = 'expired';
  else if (days >= 90) level = 'urgent';
  else if (days >= 45) level = 'warning';
  return { applicable: true, days, level };
}

export interface FirstFollowUpStatus {
  applicable: boolean;
  days: number;
  level: 'ok' | 'warning' | 'overdue';
}

/** Art. 10 / 19 — Primer seguimiento e intercesión: ventana de 15 a 30 días tras el referido. */
export function firstFollowUpStatus(record: TeaRecord): FirstFollowUpStatus {
  const hasFollowUp = record.history.some((h) => h.title !== 'Expediente creado');
  if (hasFollowUp) return { applicable: false, days: 0, level: 'ok' };
  const days = daysSince(record.fechaReferido);
  let level: FirstFollowUpStatus['level'] = 'ok';
  if (days > 30) level = 'overdue';
  else if (days >= 15) level = 'warning';
  return { applicable: true, days, level };
}

export interface StagnationStatus {
  applicable: boolean;
  days: number;
  level: 'ok' | 'warning';
}

/** Casos "En proceso" con más de 45 días sin nueva gestión. */
export function stagnationStatus(record: TeaRecord): StagnationStatus {
  if (record.estadoSeguimiento !== 'En proceso') return { applicable: false, days: 0, level: 'ok' };
  const lastDate = record.history.length > 0 ? record.history[record.history.length - 1].date : record.updatedAt;
  const days = daysSince(lastDate);
  return { applicable: true, days, level: days > 45 ? 'warning' : 'ok' };
}

export interface TermAlert {
  recordId: string;
  numeroRegistro: string;
  nombreParticipante: string;
  type: 'cubierta_provisional' | 'primer_seguimiento' | 'estancamiento';
  level: string;
  days: number;
  message: string;
}

export function computeTermAlerts(records: TeaRecord[]): TermAlert[] {
  const alerts: TermAlert[] = [];
  for (const r of records) {
    const cov = provisionalCoverageStatus(r);
    if (cov.applicable && cov.level !== 'ok') {
      alerts.push({
        recordId: r.id,
        numeroRegistro: r.numeroRegistro,
        nombreParticipante: r.nombreParticipante,
        type: 'cubierta_provisional',
        level: cov.level,
        days: cov.days,
        message: `Cubierta Especial Provisional (Art. 22): ${cov.days} de 180 días transcurridos sin diagnóstico confirmado.`,
      });
    }
    const follow = firstFollowUpStatus(r);
    if (follow.applicable && follow.level !== 'ok') {
      alerts.push({
        recordId: r.id,
        numeroRegistro: r.numeroRegistro,
        nombreParticipante: r.nombreParticipante,
        type: 'primer_seguimiento',
        level: follow.level,
        days: follow.days,
        message: `Primer seguimiento pendiente (Art. 10/19): ${follow.days} días desde el referido (ventana reglamentaria: 15-30 días).`,
      });
    }
    const stag = stagnationStatus(r);
    if (stag.applicable && stag.level !== 'ok') {
      alerts.push({
        recordId: r.id,
        numeroRegistro: r.numeroRegistro,
        nombreParticipante: r.nombreParticipante,
        type: 'estancamiento',
        level: stag.level,
        days: stag.days,
        message: `Caso "En proceso" sin gestión registrada hace ${stag.days} días.`,
      });
    }
  }
  return alerts.sort((a, b) => b.days - a.days);
}
