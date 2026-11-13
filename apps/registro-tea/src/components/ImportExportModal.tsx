import React, { useRef, useState } from 'react';
import { useDb } from '../context/DbContext';
import { useLanguage } from '../context/LanguageContext';
import { useRole } from '../context/RoleContext';
import { TeaRecord } from '../types';

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const CSV_COLUMNS: { key: keyof TeaRecord; label: string }[] = [
  { key: 'numeroRegistro', label: 'Número de Registro' },
  { key: 'fechaReferido', label: 'Fecha del Referido' },
  { key: 'region', label: 'Región' },
  { key: 'municipio', label: 'Municipio' },
  { key: 'coordinadorRegional', label: 'Coordinador Regional' },
  { key: 'medioEntrada', label: 'Medio de Entrada' },
  { key: 'nombreParticipante', label: 'Participante' },
  { key: 'edad', label: 'Edad' },
  { key: 'sexo', label: 'Sexo' },
  { key: 'diagnosticoConfirmado', label: 'Diagnóstico Confirmado' },
  { key: 'nivelApoyo', label: 'Nivel de Apoyo' },
  { key: 'etapaVida', label: 'Etapa de Vida' },
  { key: 'estadoSeguimiento', label: 'Estado de Seguimiento' },
  { key: 'tiempoRespuesta', label: 'Tiempo de Respuesta' },
  { key: 'updatedAt', label: 'Última Actualización' },
];

function toCsvValue(value: unknown): string {
  const str = Array.isArray(value) ? value.join('; ') : String(value ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function recordsToCsv(records: TeaRecord[]): string {
  const header = CSV_COLUMNS.map((c) => c.label).join(',');
  const rows = records.map((r) => CSV_COLUMNS.map((c) => toCsvValue(r[c.key])).join(','));
  return '﻿' + [header, ...rows].join('\n');
}

export const ImportExportModal: React.FC = () => {
  const { t } = useLanguage();
  const { permissions } = useRole();
  const { records, importRecords, resetData, canResetData } = useDb();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  if (!permissions.importarExportar) {
    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 text-center text-sm text-slate-500">
        Tu rol actual no tiene acceso a Importar/Exportar la base de datos. Contacta a un Supervisor, Director o Administrador.
      </div>
    );
  }

  const exportJson = () => {
    downloadBlob(`registro_tea_ley163_${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(records, null, 2), 'application/json');
  };

  const exportCsv = () => {
    downloadBlob(`registro_tea_ley163_${new Date().toISOString().slice(0, 10)}.csv`, recordsToCsv(records), 'text/csv;charset=utf-8');
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const incoming: TeaRecord[] = Array.isArray(parsed) ? parsed : [parsed];
        importRecords(incoming);
        setStatus(`Se importaron ${incoming.length} expediente(s) correctamente.`);
      } catch {
        setStatus('Error: el archivo no contiene JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t('nav_importExport')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold">Exportar Base de Datos</h3>
          <p className="text-sm text-slate-500">Descarga una copia completa de los expedientes registrados.</p>
          <div className="flex gap-2 pt-2">
            <button onClick={exportJson} className="px-3 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold">
              Descargar JSON
            </button>
            <button onClick={exportCsv} className="px-3 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold">
              Descargar CSV
            </button>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold">Importar Datos (JSON)</h3>
          <p className="text-sm text-slate-500">Carga un archivo JSON exportado previamente para fusionarlo con la base de datos actual.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
            }}
          />
          {status && <p className="text-sm text-blue-700 dark:text-blue-400">{status}</p>}
        </div>
      </div>

      <div className="border border-rose-200 dark:border-rose-900 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-rose-700 dark:text-rose-400">Zona de Riesgo</h3>
        <p className="text-sm text-slate-500">Restablece la base de datos a los expedientes de ejemplo iniciales. Esta acción no se puede deshacer.</p>
        <button
          disabled={!permissions.reiniciarBaseDatos || !canResetData}
          onClick={() => {
            if (confirm('¿Confirma que desea restablecer la base de datos a sus datos de ejemplo iniciales?')) {
              resetData();
              setStatus('Base de datos restablecida.');
            }
          }}
          className="px-3 py-2 rounded-md border border-rose-400 text-rose-700 dark:text-rose-400 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Restablecer Base de Datos
          {!canResetData ? ' (deshabilitado: base de datos en producción)' : !permissions.reiniciarBaseDatos ? ' (solo Administrador)' : ''}
        </button>
      </div>
    </div>
  );
};
