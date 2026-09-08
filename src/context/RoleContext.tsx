import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ROLE_PERMISSIONS, ROLES, Role, RolePermissions } from '../types';

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  permissions: RolePermissions;
  userName: string;
  setUserName: (name: string) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

const ROLE_STORAGE_KEY = 'tea_active_role';
const NAME_STORAGE_KEY = 'tea_active_user_name';

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    const stored = localStorage.getItem(ROLE_STORAGE_KEY);
    return (ROLES as readonly string[]).includes(stored ?? '') ? (stored as Role) : 'Coordinador';
  });
  const [userName, setUserNameState] = useState<string>(() => localStorage.getItem(NAME_STORAGE_KEY) ?? 'Alines Torres Salazar');

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    localStorage.setItem(ROLE_STORAGE_KEY, next);
  }, []);

  const setUserName = useCallback((name: string) => {
    setUserNameState(name);
    localStorage.setItem(NAME_STORAGE_KEY, name);
  }, []);

  const permissions = useMemo(() => ROLE_PERMISSIONS[role], [role]);

  const value = useMemo(
    () => ({ role, setRole, permissions, userName, setUserName }),
    [role, setRole, permissions, userName, setUserName],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
