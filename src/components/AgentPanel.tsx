import React, { useMemo, useState } from 'react';
import { useDb } from '../context/DbContext';
import { useLanguage } from '../context/LanguageContext';
import { useRole } from '../context/RoleContext';
import { answerLocalQuery, computeAutoFixPatch, runIntegrityAudit, summarizeAudit } from '../utils/integrityAgent';

const SEVERITY_STYLES: Record<string, string> = {
  critico: 'border-rose-300 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 text-rose-800 dark:text-rose-300',
  advertencia: 'border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-amber-800 dark:text-amber-300',
  info: 'border-slate-300 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 text-slate-700 dark:text-slate-300',
};

interface ChatMsg {
  role: 'user' | 'agent';
  text: string;
}

export const AgentPanel: React.FC = () => {
  const { t } = useLanguage();
  const { permissions } = useRole();
  const { records, applyAutoFix } = useDb();
  const [chat, setChat] = useState<ChatMsg[]>([
    { role: 'agent', text: 'Hola, soy el Agente Especialista en Base de Datos. Puedo auditar la integridad clínica de los expedientes y responder preguntas sobre los datos registrados.' },
  ]);
  const [query, setQuery] = useState('');

  const findings = useMemo(() => runIntegrityAudit(records), [records]);
  const summary = useMemo(() => summarizeAudit(findings, records.length), [findings, records.length]);
  const recordsById = useMemo(() => new Map(records.map((r) => [r.id, r])), [records]);

  const fixOne = (findingId: string) => {
    const finding = findings.find((f) => f.id === findingId);
    if (!finding) return;
    const record = recordsById.get(finding.recordId);
    if (!record) return;
    const patch = computeAutoFixPatch(finding, record);
    if (!patch) return;
    applyAutoFix(record.id, patch, finding.message);
  };

  const fixAll = () => {
    findings
      .filter((f) => f.autoFixable)
      .forEach((f) => fixOne(f.id));
  };

  const handleAsk = () => {
    if (!query.trim()) return;
    const question = query.trim();
    const answer = answerLocalQuery(question, records);
    setChat((prev) => [...prev, { role: 'user', text: question }, { role: 'agent', text: answer }]);
    setQuery('');
  };

  const autoFixableCount = findings.filter((f) => f.autoFixable).length;

  if (!permissions.usarAgente) {
    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 text-center text-sm text-slate-500">
        Tu rol actual no tiene acceso al Agente Especialista en Base de Datos. Contacta a un Supervisor, Director o Administrador.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{t('agent_title')}</h2>
        <p className="text-sm text-slate-500">{t('agent_desc')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Salud de Datos', value: `${summary.healthPercent}%` },
          { label: 'Críticos', value: summary.critico },
          { label: 'Advertencias', value: summary.advertencia },
          { label: 'Expedientes Afectados', value: summary.affectedRecords },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-slate-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Hallazgos de la Auditoría</h3>
        {autoFixableCount > 0 && permissions.aplicarCorrecciones && (
          <button onClick={fixAll} className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">
            {t('agent_autofix')} ({autoFixableCount})
          </button>
        )}
      </div>

      {findings.length === 0 ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3">
          ✓ {t('agent_noIssues')}
        </p>
      ) : (
        <div className="space-y-2">
          {findings.map((f) => {
            const rec = recordsById.get(f.recordId);
            return (
              <div key={f.id} className={`border rounded-lg p-3 text-sm flex items-start justify-between gap-3 ${SEVERITY_STYLES[f.severity]}`}>
                <div>
                  <p className="font-semibold">{rec?.numeroRegistro ?? f.recordId}</p>
                  <p>{f.message}</p>
                </div>
                {f.autoFixable && permissions.aplicarCorrecciones && (
                  <button
                    onClick={() => fixOne(f.id)}
                    className="shrink-0 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-current text-xs font-semibold"
                  >
                    Corregir
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold">Consultas en Lenguaje Natural</div>
        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <p
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.role === 'user' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            placeholder="Ej. ¿Cuántos casos adultos hay en proceso?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button onClick={handleAsk} className="px-3 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold">
            Preguntar
          </button>
        </div>
      </div>
    </div>
  );
};
