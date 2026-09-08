import React, { useMemo, useState } from 'react';
import { TeaRecord, REGIONES } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useRole } from '../context/RoleContext';
import { formatDate, isAdult } from '../utils/teaHelpers';
import { daysSinceLastActivity, inactivityLevel as inactivityLevelOf, INACTIVE_THRESHOLD_DAYS } from '../utils/inactivityHelper';

interface CaseListProps {
  records: TeaRecord[];
  onView: (record: TeaRecord) => void;
  onEdit: (record: TeaRecord) => void;
  onDelete: (record: TeaRecord) => void;
  onNew: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Resuelto: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'En proceso': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Pendiente: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'No localizado': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  Cerrado: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const PAGE_SIZE = 10;

export const CaseList: React.FC<CaseListProps> = ({ records, onView, onEdit, onDelete, onNew }) => {
  const { t } = useLanguage();
  const { permissions } = useRole();
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [adultFilter, setAdultFilter] = useState<'' | 'adult' | 'minor'>('');
  const [inactivityFilter, setInactivityFilter] = useState<'' | 'warning' | 'critical'>('');
  const [page, setPage] = useState(1);

  const inactiveTotal = useMemo(() => records.filter((r) => inactivityLevelOf(r) !== 'ok').length, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (q) {
        const haystack = [r.numeroRegistro, r.municipio, r.coordinadorRegional, r.nombreParticipante, ...r.agenciasGestion]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (regionFilter && r.region !== regionFilter) return false;
      if (statusFilter && r.estadoSeguimiento !== statusFilter) return false;
      if (adultFilter === 'adult' && !isAdult(r.edad)) return false;
      if (adultFilter === 'minor' && isAdult(r.edad)) return false;
      if (inactivityFilter && inactivityLevelOf(r) !== inactivityFilter) return false;
      return true;
    });
  }, [records, search, regionFilter, statusFilter, adultFilter, inactivityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRecords = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setSearch('');
    setRegionFilter('');
    setStatusFilter('');
    setAdultFilter('');
    setInactivityFilter('');
    setPage(1);
  };

  const hasFilters = search || regionFilter || statusFilter || adultFilter || inactivityFilter;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{t('nav_records')}</h2>
        {permissions.crear && (
          <button onClick={onNew} className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold">
            + {t('btn_newCase')}
          </button>
        )}
      </div>

      {inactiveTotal > 0 && (
        <button
          onClick={() => setInactivityFilter(inactivityFilter ? '' : 'warning')}
          className="w-full text-left border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300"
        >
          ⚠️ {inactiveTotal} expediente(s) sin actualizaciones en {INACTIVE_THRESHOLD_DAYS}+ días. Haz clic para {inactivityFilter ? 'quitar el filtro' : 'filtrar'}.
        </button>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          className="flex-1 min-w-[220px] rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          placeholder={t('search_placeholder')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          value={regionFilter}
          onChange={(e) => {
            setRegionFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t('filter_region')}: {t('filter_all')}</option>
          {REGIONES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t('filter_status')}: {t('filter_all')}</option>
          {['Resuelto', 'En proceso', 'Pendiente', 'No localizado', 'Cerrado'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          value={adultFilter}
          onChange={(e) => {
            setAdultFilter(e.target.value as typeof adultFilter);
            setPage(1);
          }}
        >
          <option value="">Adultos / Menores: {t('filter_all')}</option>
          <option value="adult">Adultos (18+)</option>
          <option value="minor">Menores</option>
        </select>
        <select
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          value={inactivityFilter}
          onChange={(e) => {
            setInactivityFilter(e.target.value as typeof inactivityFilter);
            setPage(1);
          }}
        >
          <option value="">Inactividad: {t('filter_all')}</option>
          <option value="warning">⚠️ Inactivos (30+ días)</option>
          <option value="critical">🚨 Críticos (60+ días)</option>
        </select>
        {hasFilters && (
          <button onClick={resetFilters} className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm">
            {t('filter_reset')}
          </button>
        )}
      </div>

      <p className="text-sm text-slate-500">{filtered.length} resultado(s)</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          {t('empty_records')}
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">{t('table_numero')}</th>
                <th className="px-3 py-2 font-semibold">{t('table_participante')}</th>
                <th className="px-3 py-2 font-semibold">{t('table_region')}</th>
                <th className="px-3 py-2 font-semibold">{t('table_municipio')}</th>
                <th className="px-3 py-2 font-semibold">{t('table_estado')}</th>
                <th className="px-3 py-2 font-semibold">{t('table_updated')}</th>
                <th className="px-3 py-2 font-semibold text-right">{t('table_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {pageRecords.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2 font-mono text-xs">{r.numeroRegistro}</td>
                  <td className="px-3 py-2">{r.nombreParticipante}</td>
                  <td className="px-3 py-2">{r.region}</td>
                  <td className="px-3 py-2">{r.municipio}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[r.estadoSeguimiento] ?? ''}`}>
                      {r.estadoSeguimiento}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {formatDate(r.updatedAt)}
                    {inactivityLevelOf(r) !== 'ok' && (
                      <span className={`block text-xs ${inactivityLevelOf(r) === 'critical' ? 'text-rose-600' : 'text-amber-600'}`}>
                        {inactivityLevelOf(r) === 'critical' ? '🚨' : '⚠️'} {daysSinceLastActivity(r)}d sin actividad
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => onView(r)} className="text-blue-700 dark:text-blue-400 hover:underline">
                      {t('btn_view')}
                    </button>
                    {permissions.editar && (
                      <button onClick={() => onEdit(r)} className="text-slate-600 dark:text-slate-300 hover:underline">
                        {t('btn_edit')}
                      </button>
                    )}
                    {permissions.eliminar && (
                      <button onClick={() => onDelete(r)} className="text-rose-600 hover:underline">
                        {t('btn_delete')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40">
            ‹
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40">
            ›
          </button>
        </div>
      )}
    </div>
  );
};
