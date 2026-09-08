import React, { useState } from 'react';
import { TeaRecord } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/teaHelpers';

interface CaseDetailModalProps {
  record: TeaRecord;
  onClose: () => void;
  onAddNote: (note: string) => void;
  onEdit: () => void;
}

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="border-b border-slate-100 dark:border-slate-800 py-1.5 flex justify-between gap-3 text-sm">
    <span className="text-slate-500 dark:text-slate-400">{label}</span>
    <span className="font-medium text-right">{value || '—'}</span>
  </div>
);

const BADGE_COLORS: Record<string, string> = {
  slate: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
};

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'slate' }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${BADGE_COLORS[color] ?? BADGE_COLORS.slate}`}>{children}</span>
);

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({ record, onClose, onAddNote, onEdit }) => {
  const { t, lang } = useLanguage();
  const [note, setNote] = useState('');

  const handleAddNote = () => {
    if (!note.trim()) return;
    onAddNote(note.trim());
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 no-print">
          <div>
            <h2 className="text-lg font-bold">{record.numeroRegistro}</h2>
            <p className="text-sm text-slate-500">{record.nombreParticipante}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-sm">
              🖨️ {t('btn_print')}
            </button>
            <button onClick={onEdit} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-sm">
              {t('btn_edit')}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none">
              ×
            </button>
          </div>
        </div>

        <div id="print-area" className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="hidden print:block border-b-2 border-slate-800 pb-3 mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide">Gobierno de Puerto Rico · Departamento de la Familia</p>
            <h1 className="text-lg font-bold">Registro de Coordinación Interinstitucional de Servicios TEA</h1>
            <p className="text-xs">Ley Núm. 163 del 13 de agosto de 2024</p>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-semibold">{record.numeroRegistro}</span>
              <span>{record.nombreParticipante}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <h3 className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400 mb-1">{t('form_sectionI')}</h3>
              <Row label="Fecha del Referido" value={formatDate(record.fechaReferido, lang)} />
              <Row label="Región" value={record.region} />
              <Row label="Municipio" value={record.municipio} />
              <Row label="Coordinador Regional" value={record.coordinadorRegional} />
              <Row label="Medio de Entrada" value={record.medioEntrada} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400 mb-1">{t('form_sectionII')}</h3>
              <Row label="Edad" value={record.edad} />
              <Row label="Sexo" value={record.sexo} />
              <Row label="Diagnóstico Confirmado" value={record.diagnosticoConfirmado} />
              <Row label="Nivel de Apoyo" value={record.nivelApoyo} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400 mb-1">{t('form_sectionV')} / {t('form_sectionVI')}</h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {record.razonesReferido.map((r) => (
                <Badge key={r}>{r}</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {record.necesidades.map((n) => (
                <Badge key={n} color="blue">
                  {n}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400 mb-1">{t('form_sectionVII')} / {t('form_sectionVIII')}</h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {record.agenciasGestion.map((a) => (
                <Badge key={a} color="emerald">
                  {a}
                </Badge>
              ))}
            </div>
            <Row label="Persona Contacto" value={record.personaContacto} />
            <Row label="Resultado Preliminar" value={record.resultadoPreliminar} />
            <Row label="Estado de Seguimiento" value={record.estadoSeguimiento} />
            <Row label="Tiempo de Respuesta" value={record.tiempoRespuesta} />
          </div>

          {record.barreras.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400 mb-1">{t('form_sectionIX')}</h3>
              <div className="flex flex-wrap gap-1.5">
                {record.barreras.map((b) => (
                  <Badge key={b} color="rose">
                    {b}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {record.observaciones && (
            <div>
              <h3 className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400 mb-1">{t('form_observaciones')}</h3>
              <p className="text-sm whitespace-pre-wrap">{record.observaciones}</p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400 mb-2">{t('history_title')}</h3>
            <div className="space-y-3 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
              {record.history
                .slice()
                .reverse()
                .map((h) => (
                  <div key={h.id} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <p className="text-sm font-semibold">{h.title}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(h.date, lang)} · {h.author} ({h.role})
                    </p>
                    {h.details && <p className="text-sm mt-0.5">{h.details}</p>}
                  </div>
                ))}
            </div>

            <div className="mt-3 flex gap-2 no-print">
              <input
                className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                placeholder="Añadir nota de seguimiento..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button onClick={handleAddNote} className="px-3 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold">
                Añadir
              </button>
            </div>
          </div>

          <div className="hidden print:grid grid-cols-2 gap-8 mt-10 pt-6">
            <div className="text-center">
              <div className="border-t border-slate-800 pt-1 text-xs">Firma del Coordinador Regional</div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-800 pt-1 text-xs">Firma del Supervisor / Departamento de la Familia</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
