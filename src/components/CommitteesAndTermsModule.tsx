import React, { useMemo, useState } from 'react';
import { useDb } from '../context/DbContext';
import { useRole } from '../context/RoleContext';
import { SUBCOMITES_ADULTOS } from '../types';
import { computeTermAlerts, isAdultsCommitteeEligible } from '../utils/ley163TermsHelper';

const LEVEL_STYLES: Record<string, string> = {
  warning: 'border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-amber-800 dark:text-amber-300',
  urgent: 'border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 text-orange-800 dark:text-orange-300',
  overdue: 'border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 text-orange-800 dark:text-orange-300',
  expired: 'border-rose-300 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 text-rose-800 dark:text-rose-300',
};

export const CommitteesAndTermsModule: React.FC = () => {
  const { records, updateRecord } = useDb();
  const { permissions, userName, role } = useRole();
  const [tab, setTab] = useState<'salud' | 'adultos' | 'plazos'>('plazos');

  const alerts = useMemo(() => computeTermAlerts(records), [records]);
  const adultsEligible = useMemo(() => records.filter(isAdultsCommitteeEligible), [records]);
  const byComite = useMemo(() => {
    const map = new Map<string, number>();
    adultsEligible.forEach((r) => {
      const key = r.subcomiteAdultos || 'Sin asignar';
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [adultsEligible]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Comités Interinstitucionales — Ley Núm. 163-2024</h2>
        <p className="text-sm text-slate-500">
          Separación reglamentaria entre el Comité de Servicios de Salud (Art. 20) y el Comité de Servicios para Adultos con TEA (Art. 10 / ADFAN).
        </p>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: 'plazos', label: `Monitor de Plazos (${alerts.length})` },
          { key: 'salud', label: 'Comité de Salud (Art. 20)' },
          { key: 'adultos', label: 'Comité de Adultos / ADFAN (Art. 10)' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === t.key ? 'border-blue-700 text-blue-700 dark:text-blue-400' : 'border-transparent text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'plazos' && (
        <div className="space-y-2">
          <p className="text-sm text-slate-500">
            Términos monitoreados: Cubierta Especial Provisional (180 días, Art. 22), Primer Seguimiento e Intercesión (15–30 días, Art. 10/19), y
            estancamiento de casos "En proceso" (45+ días).
          </p>
          {alerts.length === 0 ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3">
              ✓ No hay expedientes fuera de los términos reglamentarios de la Ley 163-2024.
            </p>
          ) : (
            alerts.map((a, i) => (
              <div key={`${a.recordId}-${a.type}-${i}`} className={`border rounded-lg p-3 text-sm ${LEVEL_STYLES[a.level] ?? ''}`}>
                <p className="font-semibold">
                  {a.numeroRegistro} · {a.nombreParticipante}
                </p>
                <p>{a.message}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'salud' && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 text-sm">
          <h3 className="font-semibold">Comité Interinstitucional de Servicios de Salud TEA (Art. 20)</h3>
          <p className="text-slate-500">
            Presidencia: Secretario(a) del Departamento de Salud. Composición: 12 integrantes (Salud, Educación, Familia, Vivienda, ARV, IDD-UPR, 2
            representantes de padres, 2 entidades proveedoras de servicios, Alianza de Autismo, y Defensoría de Personas con Impedimentos como asesor).
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
            <li>Reuniones obligatorias mínimo una vez cada 2 meses (60 días). Quórum de 6 miembros.</li>
            <li>Protocolo Uniforme de Avalúo Diagnóstico.</li>
            <li>Cubierta Especial Provisional: máximo 180 días para evaluación diagnóstica.</li>
            <li>Informe Anual a la Asamblea Legislativa en marzo.</li>
          </ul>
        </div>
      )}

      {tab === 'adultos' && (
        <div className="space-y-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 text-sm">
            <h3 className="font-semibold">Comité Interinstitucional de Servicios para Adultos con TEA (Art. 10 — ADFAN)</h3>
            <p className="text-slate-500">
              Presidencia: Secretario(a) del Departamento de la Familia. Composición: 11 integrantes (Familia, Salud, Vivienda, Educación, ARV, IDD-UPR,
              Procurador de Personas de Edad Avanzada, Defensoría de Personas con Impedimentos, 3 ciudadanos y Alianza de Autismo). Jurisdicción: adultos
              con TEA (22+ años) y transición a la vida adulta (18–21 años).
            </p>
            <p className="text-slate-600 dark:text-slate-400">{adultsEligible.length} expediente(s) elegibles para este comité.</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Distribución por Subcomité</h4>
            <div className="space-y-1 text-sm">
              {Array.from(byComite.entries()).map(([sc, n]) => (
                <div key={sc} className="flex justify-between border-b border-slate-100 dark:border-slate-800 py-1">
                  <span>{sc}</span>
                  <span className="font-semibold">{n}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold">Expediente</th>
                  <th className="px-3 py-2 font-semibold">Participante</th>
                  <th className="px-3 py-2 font-semibold">Subcomité Asignado</th>
                </tr>
              </thead>
              <tbody>
                {adultsEligible.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2 font-mono text-xs">{r.numeroRegistro}</td>
                    <td className="px-3 py-2">{r.nombreParticipante}</td>
                    <td className="px-3 py-2">
                      <select
                        disabled={!permissions.editar}
                        className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs disabled:opacity-50"
                        value={r.subcomiteAdultos ?? ''}
                        onChange={(e) =>
                          updateRecord(
                            r.id,
                            { subcomiteAdultos: e.target.value || undefined },
                            userName,
                            role,
                            'Asignación a subcomité del Comité de Adultos (Ley 163, Art. 10).',
                          )
                        }
                      >
                        <option value="">Sin asignar</option>
                        {SUBCOMITES_ADULTOS.map((sc) => (
                          <option key={sc} value={sc}>
                            {sc}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
