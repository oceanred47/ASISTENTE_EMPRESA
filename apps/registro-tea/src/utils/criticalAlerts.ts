// Unifica las alertas críticas (inactividad 60+ días y plazos vencidos de Ley 163)
// en una lista apta para notificaciones push/locales, con un id estable por alerta
// para deduplicar entre sesiones (ver notifications.ts).

import { TeaRecord } from '../types';
import { getInactiveRecords, inactivityLevel, daysSinceLastActivity } from './inactivityHelper';
import { computeTermAlerts } from './ley163TermsHelper';

export interface CriticalAlert {
  id: string;
  recordId: string;
  title: string;
  body: string;
}

export function getCriticalAlerts(records: TeaRecord[]): CriticalAlert[] {
  const alerts: CriticalAlert[] = [];

  getInactiveRecords(records)
    .filter((r) => inactivityLevel(r) === 'critical')
    .forEach((r) => {
      alerts.push({
        id: `inactivity-${r.id}-${daysSinceLastActivity(r)}`,
        recordId: r.id,
        title: `🚨 ${r.numeroRegistro} sin seguimiento`,
        body: `${r.nombreParticipante} — ${daysSinceLastActivity(r)} días sin actividad registrada.`,
      });
    });

  computeTermAlerts(records)
    .filter((a) => a.level === 'expired' || a.level === 'overdue')
    .forEach((a) => {
      alerts.push({
        id: `term-${a.recordId}-${a.type}-${a.days}`,
        recordId: a.recordId,
        title: `🚨 ${a.numeroRegistro} — plazo Ley 163 vencido`,
        body: a.message,
      });
    });

  return alerts;
}
