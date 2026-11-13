import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useRole } from '../context/RoleContext';
import { useAuth } from '../context/AuthContext';
import { ROLES, TeaRecord } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { UserManagementModal } from './UserManagementModal';

export type TabKey = 'records' | 'analytics' | 'agent' | 'importExport' | 'committees';

interface NavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  alertCount: number;
  inactiveCount: number;
  records: TeaRecord[];
  onOpenCase: (record: TeaRecord) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, alertCount, inactiveCount, records, onOpenCase }) => {
  const { t, lang, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { role, setRole, canSelfSelectRole, userName } = useRole();
  const { isFirebaseConfigured, user, signOutUser } = useAuth();
  const [showUserManagement, setShowUserManagement] = useState(false);

  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: 'records', label: t('nav_records'), badge: inactiveCount },
    { key: 'analytics', label: t('nav_analytics') },
    { key: 'committees', label: 'Comités Ley 163' },
    { key: 'agent', label: t('nav_agent'), badge: alertCount },
    { key: 'importExport', label: t('nav_importExport') },
  ];

  return (
    <header className="sticky top-0 z-30 no-print">
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold leading-snug">{t('appTitle')}</h1>
            <p className="text-xs sm:text-sm text-blue-200 leading-snug">{t('appSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            {canSelfSelectRole ? (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-semibold transition border-none focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="rol activo"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="text-slate-900">
                    {r}
                  </option>
                ))}
              </select>
            ) : (
              <span className="px-2 py-1.5 rounded-md bg-white/10 text-sm font-semibold" title={userName}>
                {role}
              </span>
            )}
            {isFirebaseConfigured && role === 'Administrador' && (
              <button
                onClick={() => setShowUserManagement(true)}
                className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-semibold transition"
              >
                Usuarios
              </button>
            )}
            <NotificationCenter records={records} onOpenCase={onOpenCase} />
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-semibold transition"
              aria-label="toggle language"
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-semibold transition"
              aria-label="toggle theme"
            >
              {theme === 'light' ? t('theme_dark') : t('theme_light')}
            </button>
            {isFirebaseConfigured && user && (
              <button
                onClick={() => signOutUser()}
                className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-semibold transition"
                title={user.email ?? undefined}
              >
                Salir
              </button>
            )}
          </div>
        </div>
      </div>
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-blue-700 text-blue-700 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {!!tab.badge && tab.badge > 0 && (
                <span className="ml-2 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-amber-500 text-white w-5 h-5">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {showUserManagement && <UserManagementModal onClose={() => setShowUserManagement(false)} />}
    </header>
  );
};
