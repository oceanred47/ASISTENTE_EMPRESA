import { TeaRecord } from '../types';

export const INACTIVE_THRESHOLD_DAYS = 30;
export const CRITICAL_THRESHOLD_DAYS = 60;

/** Days since the last history event, falling back to updatedAt/createdAt/fechaReferido. */
export function daysSinceLastActivity(record: TeaRecord): number {
  const lastHistoryDate = record.history.length > 0 ? record.history[record.history.length - 1].date : undefined;
  const referenceDate = lastHistoryDate ?? record.updatedAt ?? record.createdAt ?? record.fechaReferido;
  const then = new Date(referenceDate).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

export type InactivityLevel = 'ok' | 'warning' | 'critical';

export function inactivityLevel(record: TeaRecord): InactivityLevel {
  if (record.estadoSeguimiento === 'Resuelto' || record.estadoSeguimiento === 'Cerrado') return 'ok';
  const days = daysSinceLastActivity(record);
  if (days >= CRITICAL_THRESHOLD_DAYS) return 'critical';
  if (days >= INACTIVE_THRESHOLD_DAYS) return 'warning';
  return 'ok';
}

export function getInactiveRecords(records: TeaRecord[]): TeaRecord[] {
  return records.filter((r) => inactivityLevel(r) !== 'ok').sort((a, b) => daysSinceLastActivity(b) - daysSinceLastActivity(a));
}
