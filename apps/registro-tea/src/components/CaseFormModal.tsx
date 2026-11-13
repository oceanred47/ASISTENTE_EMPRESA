import React, { useMemo, useState } from 'react';
import {
  AGENCIAS_GESTION,
  BARRERAS,
  NECESIDADES,
  RAZONES_REFERIDO,
  REGIONES,
  TeaRecord,
  TeaRecordInput,
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { calcEtapaVida, ETAPA_VIDA_LABELS, generateNumeroRegistro } from '../utils/teaHelpers';

interface CaseFormModalProps {
  existing?: TeaRecord;
  allRecords: TeaRecord[];
  onSave: (input: TeaRecordInput) => void;
  onClose: () => void;
}

const CheckboxGroup: React.FC<{
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
}> = ({ options, selected, onChange }) => {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          onClick={() => toggle(opt)}
          className={`px-2.5 py-1 rounded-full text-xs border transition ${
            selected.includes(opt)
              ? 'bg-blue-700 border-blue-700 text-white'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
    <h3 className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400">{title}</h3>
    {children}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</span>
    {children}
  </label>
);

const inputCls =
  'w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export const CaseFormModal: React.FC<CaseFormModalProps> = ({ existing, allRecords, onSave, onClose }) => {
  const { t } = useLanguage();

  const [numeroRegistro, setNumeroRegistro] = useState(
    existing?.numeroRegistro ?? generateNumeroRegistro(allRecords.map((r) => r.numeroRegistro)),
  );
  const [fechaReferido, setFechaReferido] = useState(existing?.fechaReferido?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [region, setRegion] = useState(existing?.region ?? REGIONES[0]);
  const [municipio, setMunicipio] = useState(existing?.municipio ?? '');
  const [coordinadorRegional, setCoordinadorRegional] = useState(existing?.coordinadorRegional ?? '');
  const [medioEntrada, setMedioEntrada] = useState(existing?.medioEntrada ?? 'Familia');

  const [nombreParticipante, setNombreParticipante] = useState(existing?.nombreParticipante ?? '');
  const [edad, setEdad] = useState(existing?.edad ?? 18);
  const [sexo, setSexo] = useState(existing?.sexo ?? 'Prefiere no contestar');
  const [diagnosticoConfirmado, setDiagnosticoConfirmado] = useState(existing?.diagnosticoConfirmado ?? 'En evaluación');
  const [nivelApoyo, setNivelApoyo] = useState(existing?.nivelApoyo ?? 'Desconocido');

  const [etapaVidaOverride, setEtapaVidaOverride] = useState(existing?.etapaVida);
  const etapaVida = etapaVidaOverride ?? calcEtapaVida(edad);

  const [convivencia, setConvivencia] = useState(existing?.convivencia ?? 'Otro');

  const [razonesReferido, setRazonesReferido] = useState<string[]>(existing?.razonesReferido ?? []);
  const [necesidades, setNecesidades] = useState<string[]>(existing?.necesidades ?? []);
  const [agenciasGestion, setAgenciasGestion] = useState<string[]>(existing?.agenciasGestion ?? []);
  const [fechaGestion, setFechaGestion] = useState(existing?.fechaGestion?.slice(0, 10) ?? '');
  const [personaContacto, setPersonaContacto] = useState(existing?.personaContacto ?? '');
  const [resultadoPreliminar, setResultadoPreliminar] = useState(existing?.resultadoPreliminar ?? '');

  const [estadoSeguimiento, setEstadoSeguimiento] = useState(existing?.estadoSeguimiento ?? 'Pendiente');
  const [tiempoRespuesta, setTiempoRespuesta] = useState(existing?.tiempoRespuesta);

  const [barreras, setBarreras] = useState<string[]>(existing?.barreras ?? []);
  const [observaciones, setObservaciones] = useState(existing?.observaciones ?? '');

  const duplicate = useMemo(() => {
    return allRecords.find(
      (r) =>
        r.id !== existing?.id &&
        ((numeroRegistro.trim() && r.numeroRegistro.trim().toLowerCase() === numeroRegistro.trim().toLowerCase()) ||
          (nombreParticipante.trim() && r.nombreParticipante.trim().toLowerCase() === nombreParticipante.trim().toLowerCase())),
    );
  }, [allRecords, numeroRegistro, nombreParticipante, existing]);

  const [confirmDuplicate, setConfirmDuplicate] = useState(false);

  const canSubmit = numeroRegistro.trim() && municipio.trim() && coordinadorRegional.trim() && nombreParticipante.trim() && (!duplicate || confirmDuplicate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const input: TeaRecordInput = {
      numeroRegistro: numeroRegistro.trim(),
      fechaReferido: new Date(fechaReferido).toISOString(),
      region,
      municipio: municipio.trim(),
      coordinadorRegional: coordinadorRegional.trim(),
      medioEntrada,
      nombreParticipante: nombreParticipante.trim(),
      edad,
      sexo,
      diagnosticoConfirmado,
      nivelApoyo,
      etapaVida,
      convivencia,
      razonesReferido,
      necesidades,
      agenciasGestion,
      fechaGestion: fechaGestion ? new Date(fechaGestion).toISOString() : undefined,
      personaContacto: personaContacto.trim() || undefined,
      resultadoPreliminar: resultadoPreliminar.trim() || undefined,
      estadoSeguimiento,
      tiempoRespuesta,
      barreras,
      observaciones: observaciones.trim() || undefined,
    };
    onSave(input);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold">{existing ? t('btn_edit') : t('btn_newCase')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <Section title={t('form_sectionI')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Número de Registro">
                <input className={inputCls} value={numeroRegistro} onChange={(e) => setNumeroRegistro(e.target.value)} />
              </Field>
              <Field label="Fecha del Referido">
                <input type="date" className={inputCls} value={fechaReferido} onChange={(e) => setFechaReferido(e.target.value)} />
              </Field>
              <Field label="Región">
                <select className={inputCls} value={region} onChange={(e) => setRegion(e.target.value as typeof region)}>
                  {REGIONES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Municipio">
                <input className={inputCls} value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
              </Field>
              <Field label="Coordinador Regional">
                <input className={inputCls} value={coordinadorRegional} onChange={(e) => setCoordinadorRegional(e.target.value)} />
              </Field>
              <Field label="Medio de Entrada">
                <select className={inputCls} value={medioEntrada} onChange={(e) => setMedioEntrada(e.target.value as typeof medioEntrada)}>
                  {[
                    'Línea de Orientación',
                    'Familia',
                    'Persona con TEA',
                    'Departamento de Salud',
                    'Departamento de Educación',
                    'ACUDEN',
                    'ADFAN',
                    'ADSEF',
                    'ASUME',
                    'Rehabilitación Vocacional',
                    'Departamento del Trabajo',
                    'Municipio',
                    'Organización Comunitaria',
                    'Otro',
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          <Section title={t('form_sectionII')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nombre del Participante">
                <input className={inputCls} value={nombreParticipante} onChange={(e) => setNombreParticipante(e.target.value)} />
              </Field>
              <Field label="Edad">
                <input
                  type="number"
                  min={0}
                  max={120}
                  className={inputCls}
                  value={edad}
                  onChange={(e) => {
                    setEdad(Number(e.target.value));
                    setEtapaVidaOverride(undefined);
                  }}
                />
              </Field>
              <Field label="Sexo">
                <select className={inputCls} value={sexo} onChange={(e) => setSexo(e.target.value as typeof sexo)}>
                  {['Femenino', 'Masculino', 'Otro', 'Prefiere no contestar'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Diagnóstico Confirmado">
                <select
                  className={inputCls}
                  value={diagnosticoConfirmado}
                  onChange={(e) => setDiagnosticoConfirmado(e.target.value as typeof diagnosticoConfirmado)}
                >
                  {['Sí', 'No', 'En evaluación'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Nivel de Apoyo (DSM-5)">
                <select className={inputCls} value={nivelApoyo} onChange={(e) => setNivelApoyo(e.target.value as typeof nivelApoyo)}>
                  {['Nivel 1', 'Nivel 2', 'Nivel 3', 'Desconocido'].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          <Section title={t('form_sectionIII')}>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Calculada automáticamente según edad: <strong>{ETAPA_VIDA_LABELS[etapaVida].es}</strong>. Puede ajustarse manualmente si es necesario.
            </p>
            <select
              className={inputCls}
              value={etapaVida}
              onChange={(e) => setEtapaVidaOverride(e.target.value as typeof etapaVida)}
            >
              {Object.entries(ETAPA_VIDA_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label.es}
                </option>
              ))}
            </select>
          </Section>

          <Section title={t('form_sectionIV')}>
            <select className={inputCls} value={convivencia} onChange={(e) => setConvivencia(e.target.value as typeof convivencia)}>
              {['Padre', 'Madre', 'Ambos padres', 'Tutor', 'Familiar', 'Cónyuge/Pareja', 'Independiente', 'Hogar asistido', 'Otro'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Section>

          <Section title={t('form_sectionV')}>
            <div className="space-y-3">
              {Object.entries(RAZONES_REFERIDO).map(([groupKey, opts]) => (
                <div key={groupKey}>
                  <p className="text-xs font-semibold text-slate-500 mb-1 uppercase">{groupKey}</p>
                  <CheckboxGroup options={opts} selected={razonesReferido} onChange={setRazonesReferido} />
                </div>
              ))}
            </div>
          </Section>

          <Section title={t('form_sectionVI')}>
            <CheckboxGroup options={NECESIDADES} selected={necesidades} onChange={setNecesidades} />
          </Section>

          <Section title={t('form_sectionVII')}>
            <div className="space-y-3">
              <CheckboxGroup options={AGENCIAS_GESTION} selected={agenciasGestion} onChange={setAgenciasGestion} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Fecha del Referido a la Agencia">
                  <input type="date" className={inputCls} value={fechaGestion} onChange={(e) => setFechaGestion(e.target.value)} />
                </Field>
                <Field label="Persona Contacto">
                  <input className={inputCls} value={personaContacto} onChange={(e) => setPersonaContacto(e.target.value)} />
                </Field>
              </div>
              <Field label="Resultado Preliminar">
                <textarea className={inputCls} rows={2} value={resultadoPreliminar} onChange={(e) => setResultadoPreliminar(e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title={t('form_sectionVIII')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Estado">
                <select className={inputCls} value={estadoSeguimiento} onChange={(e) => setEstadoSeguimiento(e.target.value as typeof estadoSeguimiento)}>
                  {['Resuelto', 'En proceso', 'Pendiente', 'No localizado', 'Cerrado'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tiempo de Respuesta">
                <select
                  className={inputCls}
                  value={tiempoRespuesta ?? ''}
                  onChange={(e) => setTiempoRespuesta((e.target.value || undefined) as typeof tiempoRespuesta)}
                >
                  <option value="">—</option>
                  {['Menos de 30 días', '31 a 60 días', '61 a 90 días', 'Más de 90 días'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          <Section title={t('form_sectionIX')}>
            <CheckboxGroup options={BARRERAS} selected={barreras} onChange={setBarreras} />
          </Section>

          <Section title={t('form_observaciones')}>
            <textarea className={inputCls} rows={3} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </Section>

          {duplicate && (
            <div className="border border-amber-400 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700 rounded-lg p-3 text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300">⚠️ Registro Duplicado Detectado en el Sistema</p>
              <p className="text-amber-700 dark:text-amber-400 mt-1">
                Ya existe un expediente ({duplicate.numeroRegistro}) para "{duplicate.nombreParticipante}" en {duplicate.municipio}, {duplicate.region} —
                estado: {duplicate.estadoSeguimiento}.
              </p>
              <label className="flex items-center gap-2 mt-2 text-amber-800 dark:text-amber-300">
                <input type="checkbox" checked={confirmDuplicate} onChange={(e) => setConfirmDuplicate(e.target.checked)} />
                Confirmar y autorizar guardado a pesar de la coincidencia/duplicado
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-white dark:bg-slate-900 pb-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium">
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold"
            >
              {t('btn_save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
