import React, { useMemo, useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { DbProvider, useDb } from './context/DbContext';
import { Navbar, TabKey } from './components/Navbar';
import { CaseList } from './components/CaseList';
import { CaseFormModal } from './components/CaseFormModal';
import { CaseDetailModal } from './components/CaseDetailModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AgentPanel } from './components/AgentPanel';
import { ImportExportModal } from './components/ImportExportModal';
import { TeaRecord, TeaRecordInput } from './types';
import { runIntegrityAudit } from './utils/integrityAgent';

const CURRENT_USER = { name: 'Alines Torres Salazar', role: 'Coordinador' };

const AppShell: React.FC = () => {
  const { t } = useLanguage();
  const { records, addRecord, updateRecord, deleteRecord, addHistoryNote } = useDb();

  const [activeTab, setActiveTab] = useState<TabKey>('records');
  const [formTarget, setFormTarget] = useState<TeaRecord | 'new' | null>(null);
  const [viewTarget, setViewTarget] = useState<TeaRecord | null>(null);

  const alertCount = useMemo(() => runIntegrityAudit(records).length, [records]);

  const handleSave = (input: TeaRecordInput) => {
    if (formTarget && formTarget !== 'new') {
      updateRecord(formTarget.id, input, CURRENT_USER.name, CURRENT_USER.role, 'Datos del expediente actualizados desde el formulario.');
    } else {
      addRecord(input, CURRENT_USER.name, CURRENT_USER.role);
    }
    setFormTarget(null);
  };

  const handleDelete = (record: TeaRecord) => {
    if (confirm(t('confirm_delete'))) {
      deleteRecord(record.id);
      if (viewTarget?.id === record.id) setViewTarget(null);
    }
  };

  const viewedRecord = viewTarget ? records.find((r) => r.id === viewTarget.id) ?? null : null;

  return (
    <div className="min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} alertCount={alertCount} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'records' && (
          <CaseList
            records={records}
            onView={(r) => setViewTarget(r)}
            onEdit={(r) => setFormTarget(r)}
            onDelete={handleDelete}
            onNew={() => setFormTarget('new')}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'agent' && <AgentPanel />}
        {activeTab === 'importExport' && <ImportExportModal />}
      </main>

      {formTarget && (
        <CaseFormModal
          existing={formTarget === 'new' ? undefined : formTarget}
          allRecords={records}
          onSave={handleSave}
          onClose={() => setFormTarget(null)}
        />
      )}

      {viewedRecord && (
        <CaseDetailModal
          record={viewedRecord}
          onClose={() => setViewTarget(null)}
          onAddNote={(note) => addHistoryNote(viewedRecord.id, note, CURRENT_USER.name, CURRENT_USER.role)}
          onEdit={() => {
            setFormTarget(viewedRecord);
            setViewTarget(null);
          }}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <ThemeProvider>
      <DbProvider>
        <AppShell />
      </DbProvider>
    </ThemeProvider>
  </LanguageProvider>
);

export default App;
