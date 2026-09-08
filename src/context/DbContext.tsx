import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TeaRecord, TeaRecordInput, RecordHistoryEntry } from '../types';
import { initialData } from '../data/initialData';
import { generateId } from '../utils/teaHelpers';

const STORAGE_KEY = 'tea_records_db_v1';

function loadFromStorage(): TeaRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialData;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as TeaRecord[];
    return initialData;
  } catch {
    return initialData;
  }
}

function saveToStorage(records: TeaRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // storage full or unavailable; fail silently, in-memory state still holds
  }
}

/** Ensures every record has well-formed, non-undefined fields before persisting. */
function sanitizeRecord(input: Partial<TeaRecord>): TeaRecord {
  return {
    id: input.id ?? generateId(),
    numeroRegistro: input.numeroRegistro ?? '',
    fechaReferido: input.fechaReferido ?? new Date().toISOString(),
    region: input.region ?? 'San Juan',
    municipio: input.municipio ?? '',
    coordinadorRegional: input.coordinadorRegional ?? '',
    medioEntrada: input.medioEntrada ?? 'Otro',
    nombreParticipante: input.nombreParticipante ?? '',
    edad: typeof input.edad === 'number' ? input.edad : 0,
    sexo: input.sexo ?? 'Prefiere no contestar',
    diagnosticoConfirmado: input.diagnosticoConfirmado ?? 'En evaluación',
    nivelApoyo: input.nivelApoyo ?? 'Desconocido',
    etapaVida: input.etapaVida ?? '0-2',
    convivencia: input.convivencia ?? 'Otro',
    razonesReferido: input.razonesReferido ?? [],
    necesidades: input.necesidades ?? [],
    agenciasGestion: input.agenciasGestion ?? [],
    fechaGestion: input.fechaGestion,
    personaContacto: input.personaContacto,
    resultadoPreliminar: input.resultadoPreliminar,
    estadoSeguimiento: input.estadoSeguimiento ?? 'Pendiente',
    tiempoRespuesta: input.tiempoRespuesta,
    barreras: input.barreras ?? [],
    observaciones: input.observaciones,
    subcomiteAdultos: input.subcomiteAdultos,
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
    history: input.history ?? [],
  };
}

interface DbContextValue {
  records: TeaRecord[];
  addRecord: (input: TeaRecordInput, author: string, role: string) => TeaRecord;
  updateRecord: (id: string, patch: Partial<TeaRecordInput>, author: string, role: string, changeSummary?: string) => void;
  deleteRecord: (id: string) => void;
  addHistoryNote: (id: string, note: string, author: string, role: string) => void;
  applyAutoFix: (id: string, patch: Partial<TeaRecordInput>, note: string) => void;
  importRecords: (records: TeaRecord[]) => void;
  resetData: () => void;
}

const DbContext = createContext<DbContextValue | undefined>(undefined);

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<TeaRecord[]>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(records);
  }, [records]);

  const addRecord = useCallback((input: TeaRecordInput, author: string, role: string): TeaRecord => {
    const nowIso = new Date().toISOString();
    const historyEntry: RecordHistoryEntry = {
      id: generateId(),
      date: nowIso,
      author,
      role,
      title: 'Expediente creado',
      details: `Registro ${input.numeroRegistro} creado en el sistema.`,
    };
    const record = sanitizeRecord({
      ...input,
      id: generateId(),
      createdAt: nowIso,
      updatedAt: nowIso,
      history: [historyEntry],
    });
    setRecords((prev) => [record, ...prev]);
    return record;
  }, []);

  const updateRecord = useCallback(
    (id: string, patch: Partial<TeaRecordInput>, author: string, role: string, changeSummary?: string) => {
      setRecords((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const nowIso = new Date().toISOString();
          const historyEntry: RecordHistoryEntry = {
            id: generateId(),
            date: nowIso,
            author,
            role,
            title: 'Expediente actualizado',
            details: changeSummary ?? 'Se actualizaron datos del expediente.',
            fields: Object.keys(patch),
          };
          return sanitizeRecord({
            ...r,
            ...patch,
            updatedAt: nowIso,
            history: [...r.history, historyEntry],
          });
        }),
      );
    },
    [],
  );

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addHistoryNote = useCallback((id: string, note: string, author: string, role: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nowIso = new Date().toISOString();
        const entry: RecordHistoryEntry = {
          id: generateId(),
          date: nowIso,
          author,
          role,
          title: 'Nota de seguimiento',
          details: note,
        };
        return { ...r, updatedAt: nowIso, history: [...r.history, entry] };
      }),
    );
  }, []);

  const applyAutoFix = useCallback((id: string, patch: Partial<TeaRecordInput>, note: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nowIso = new Date().toISOString();
        const entry: RecordHistoryEntry = {
          id: generateId(),
          date: nowIso,
          author: 'Agente de Base de Datos',
          role: 'Sistema (IA)',
          title: 'Corrección automática de integridad',
          details: note,
          fields: Object.keys(patch),
        };
        return sanitizeRecord({ ...r, ...patch, updatedAt: nowIso, history: [...r.history, entry] });
      }),
    );
  }, []);

  const importRecords = useCallback((incoming: TeaRecord[]) => {
    setRecords((prev) => {
      const byId = new Map(prev.map((r) => [r.id, r]));
      incoming.forEach((rec) => {
        byId.set(rec.id || generateId(), sanitizeRecord(rec));
      });
      return Array.from(byId.values());
    });
  }, []);

  const resetData = useCallback(() => {
    setRecords(initialData);
  }, []);

  const value = useMemo(
    () => ({ records, addRecord, updateRecord, deleteRecord, addHistoryNote, applyAutoFix, importRecords, resetData }),
    [records, addRecord, updateRecord, deleteRecord, addHistoryNote, applyAutoFix, importRecords, resetData],
  );

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>;
};

export function useDb() {
  const ctx = useContext(DbContext);
  if (!ctx) throw new Error('useDb must be used within DbProvider');
  return ctx;
}
