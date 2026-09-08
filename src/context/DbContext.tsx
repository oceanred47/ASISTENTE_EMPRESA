import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { TeaRecord, TeaRecordInput, RecordHistoryEntry } from '../types';
import { initialData } from '../data/initialData';
import { generateId } from '../utils/teaHelpers';
import { db, isFirebaseConfigured } from '../lib/firebase';

const STORAGE_KEY = 'tea_records_db_v1';
const COLLECTION_NAME = 'tea_records';

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
  loading: boolean;
  addRecord: (input: TeaRecordInput, author: string, role: string) => TeaRecord;
  updateRecord: (id: string, patch: Partial<TeaRecordInput>, author: string, role: string, changeSummary?: string) => void;
  deleteRecord: (id: string) => void;
  addHistoryNote: (id: string, note: string, author: string, role: string) => void;
  applyAutoFix: (id: string, patch: Partial<TeaRecordInput>, note: string) => void;
  importRecords: (records: TeaRecord[]) => void;
  resetData: () => void;
  /** false cuando la base de datos vive en Firestore: restablecer a datos de ejemplo borraría casos reales. */
  canResetData: boolean;
}

const DbContext = createContext<DbContextValue | undefined>(undefined);

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<TeaRecord[]>(() => (isFirebaseConfigured ? [] : loadFromStorage()));
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const recordsRef = useRef(records);
  recordsRef.current = records;

  // Modo local: persiste en localStorage en cada cambio.
  useEffect(() => {
    if (isFirebaseConfigured) return;
    saveToStorage(records);
  }, [records]);

  // Modo Firebase: se suscribe en tiempo real a la colección de expedientes.
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        setRecords(snap.docs.map((d) => sanitizeRecord({ id: d.id, ...d.data() } as Partial<TeaRecord>)));
        setLoading(false);
      },
      (err) => {
        console.error('Error al sincronizar con Firestore:', err);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  /** Persiste un expediente completo: Firestore (fuente de verdad compartida) o estado local. */
  const persist = useCallback((record: TeaRecord) => {
    if (isFirebaseConfigured && db) {
      setDoc(doc(db, COLLECTION_NAME, record.id), record).catch((err) => console.error('No se pudo guardar el expediente:', err));
    } else {
      setRecords((prev) => {
        const exists = prev.some((r) => r.id === record.id);
        return exists ? prev.map((r) => (r.id === record.id ? record : r)) : [record, ...prev];
      });
    }
  }, []);

  const addRecord = useCallback(
    (input: TeaRecordInput, author: string, role: string): TeaRecord => {
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
      persist(record);
      return record;
    },
    [persist],
  );

  const updateRecord = useCallback(
    (id: string, patch: Partial<TeaRecordInput>, author: string, role: string, changeSummary?: string) => {
      const current = recordsRef.current.find((r) => r.id === id);
      if (!current) return;
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
      const updated = sanitizeRecord({ ...current, ...patch, updatedAt: nowIso, history: [...current.history, historyEntry] });
      persist(updated);
    },
    [persist],
  );

  const deleteRecord = useCallback((id: string) => {
    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, COLLECTION_NAME, id)).catch((err) => console.error('No se pudo eliminar el expediente:', err));
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  }, []);

  const addHistoryNote = useCallback(
    (id: string, note: string, author: string, role: string) => {
      const current = recordsRef.current.find((r) => r.id === id);
      if (!current) return;
      const nowIso = new Date().toISOString();
      const entry: RecordHistoryEntry = { id: generateId(), date: nowIso, author, role, title: 'Nota de seguimiento', details: note };
      persist({ ...current, updatedAt: nowIso, history: [...current.history, entry] });
    },
    [persist],
  );

  const applyAutoFix = useCallback(
    (id: string, patch: Partial<TeaRecordInput>, note: string) => {
      const current = recordsRef.current.find((r) => r.id === id);
      if (!current) return;
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
      persist(sanitizeRecord({ ...current, ...patch, updatedAt: nowIso, history: [...current.history, entry] }));
    },
    [persist],
  );

  const importRecords = useCallback((incoming: TeaRecord[]) => {
    const sanitized = incoming.map((rec) => sanitizeRecord({ ...rec, id: rec.id || generateId() }));
    if (isFirebaseConfigured && db) {
      Promise.all(sanitized.map((rec) => setDoc(doc(db!, COLLECTION_NAME, rec.id), rec))).catch((err) =>
        console.error('No se pudieron importar algunos expedientes:', err),
      );
    } else {
      setRecords((prev) => {
        const byId = new Map(prev.map((r) => [r.id, r]));
        sanitized.forEach((rec) => byId.set(rec.id, rec));
        return Array.from(byId.values());
      });
    }
  }, []);

  const resetData = useCallback(() => {
    if (isFirebaseConfigured) return; // deshabilitado en producción: ver canResetData
    setRecords(initialData);
  }, []);

  const value = useMemo(
    () => ({
      records,
      loading,
      addRecord,
      updateRecord,
      deleteRecord,
      addHistoryNote,
      applyAutoFix,
      importRecords,
      resetData,
      canResetData: !isFirebaseConfigured,
    }),
    [records, loading, addRecord, updateRecord, deleteRecord, addHistoryNote, applyAutoFix, importRecords, resetData],
  );

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>;
};

export function useDb() {
  const ctx = useContext(DbContext);
  if (!ctx) throw new Error('useDb must be used within DbProvider');
  return ctx;
}
