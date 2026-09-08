import React, { useState } from 'react';
import { TeaRecord } from '../types';
import { daysSinceLastActivity, getInactiveRecords, inactivityLevel } from '../utils/inactivityHelper';

interface NotificationCenterProps {
  records: TeaRecord[];
  onOpenCase: (record: TeaRecord) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ records, onOpenCase }) => {
  const [open, setOpen] = useState(false);
  const inactive = getInactiveRecords(records);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-semibold transition"
        aria-label="notificaciones"
      >
        🔔
        {inactive.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-rose-500 text-white w-4 h-4">
            {inactive.length}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 z-50">
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm">
              Expedientes sin seguimiento reciente
            </div>
            {inactive.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No hay expedientes con seguimiento vencido.</p>
            ) : (
              <ul>
                {inactive.map((r) => {
                  const level = inactivityLevel(r);
                  return (
                    <li key={r.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <button
                        onClick={() => {
                          onOpenCase(r);
                          setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-sm"
                      >
                        <p className="font-medium">
                          {level === 'critical' ? '🚨' : '⚠️'} {r.numeroRegistro} · {r.nombreParticipante}
                        </p>
                        <p className="text-xs text-slate-500">
                          {r.municipio}, {r.region} · {daysSinceLastActivity(r)} días sin actividad
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};
