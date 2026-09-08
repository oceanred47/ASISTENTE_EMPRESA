import React, { useMemo } from 'react';
import { useDb } from '../context/DbContext';
import { useLanguage } from '../context/LanguageContext';
import { isAdult } from '../utils/teaHelpers';

const BAR_COLORS = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-cyan-500', 'bg-slate-500'];

export const AnalyticsDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { records } = useDb();

  const total = records.length;
  const adultos = records.filter((r) => isAdult(r.edad)).length;
  const resueltos = records.filter((r) => r.estadoSeguimiento === 'Resuelto').length;

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => map.set(r.estadoSeguimiento, (map.get(r.estadoSeguimiento) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [records]);

  const byRegion = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => map.set(r.region, (map.get(r.region) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [records]);

  const byCoordinador = useMemo(() => {
    const map = new Map<string, number>();
    records
      .filter((r) => r.estadoSeguimiento === 'En proceso' || r.estadoSeguimiento === 'Pendiente')
      .forEach((r) => map.set(r.coordinadorRegional || 'Sin asignar', (map.get(r.coordinadorRegional || 'Sin asignar') ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [records]);

  const maxCoordinador = Math.max(1, ...byCoordinador.map(([, n]) => n));

  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t('nav_analytics')}</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-xs text-slate-500">{t('kpi_total')}</p>
        </div>
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <p className="text-3xl font-bold">{adultos}</p>
          <p className="text-xs text-slate-500">
            {t('kpi_adultos')} · {pct(adultos)}%
          </p>
        </div>
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <p className="text-3xl font-bold">{resueltos}</p>
          <p className="text-xs text-slate-500">
            {t('kpi_resueltos')} · {pct(resueltos)}%
          </p>
        </div>
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <p className="text-3xl font-bold">{byRegion.length}</p>
          <p className="text-xs text-slate-500">Regiones Activas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Distribución por Estado de Seguimiento</h3>
          <div className="space-y-2">
            {byStatus.map(([status, n], i) => (
              <div key={status}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span>{status}</span>
                  <span>
                    {n} ({pct(n)}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                    style={{ width: `${pct(n)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Distribución por Región</h3>
          <div className="space-y-2">
            {byRegion.map(([region, n], i) => (
              <div key={region}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span>{region}</span>
                  <span>{n}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ width: `${pct(n)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
        <h3 className="font-semibold mb-1">Carga de Trabajo por Coordinador Regional</h3>
        <p className="text-xs text-slate-500 mb-3">Casos activos (En proceso / Pendiente) asignados a cada coordinador.</p>
        <div className="space-y-2">
          {byCoordinador.length === 0 ? (
            <p className="text-sm text-slate-500">No hay casos activos.</p>
          ) : (
            byCoordinador.map(([coord, n]) => {
              const relPct = Math.round((n / maxCoordinador) * 100);
              const level = n >= maxCoordinador ? 'Carga Alta' : n >= maxCoordinador / 2 ? 'Carga Media' : 'Carga Balanceada';
              return (
                <div key={coord}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>
                      {coord} · <span className="text-slate-500">{level}</span>
                    </span>
                    <span>{n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${relPct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
