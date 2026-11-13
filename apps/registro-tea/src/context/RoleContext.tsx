import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { ROLE_PERMISSIONS, ROLES, Role, RolePermissions } from '../types';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  permissions: RolePermissions;
  userName: string;
  setUserName: (name: string) => void;
  /** false in Firebase mode: role is assigned by an Administrador, not self-selected. */
  canSelfSelectRole: boolean;
  profileLoading: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

const ROLE_STORAGE_KEY = 'tea_active_role';
const NAME_STORAGE_KEY = 'tea_active_user_name';

function useLocalRole() {
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

  return { role, setRole, userName, setUserName, canSelfSelectRole: true, profileLoading: false };
}

function useFirebaseRole() {
  const { user } = useAuth();
  const [role, setRoleState] = useState<Role>('Coordinador');
  const [userName, setUserNameState] = useState<string>('');
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const ref = doc(db, 'users', user.uid);
    const displayName = user.displayName || user.email || 'Usuario';

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as { role?: Role; userName?: string };
        setRoleState((ROLES as readonly string[]).includes(data.role ?? '') ? (data.role as Role) : 'Coordinador');
        setUserNameState(data.userName || displayName);
      } else {
        setDoc(ref, {
          role: 'Coordinador',
          userName: displayName,
          email: user.email,
          createdAt: serverTimestamp(),
        }).catch((err) => console.error('No se pudo crear el perfil de usuario:', err));
        setRoleState('Coordinador');
        setUserNameState(displayName);
      }
      setProfileLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const setUserName = useCallback(
    (name: string) => {
      setUserNameState(name);
      if (user && db) {
        setDoc(doc(db, 'users', user.uid), { userName: name }, { merge: true }).catch((err) =>
          console.error('No se pudo actualizar el nombre de usuario:', err),
        );
      }
    },
    [user],
  );

  // El rol propio no es auto-asignable en modo Firebase; lo cambia un Administrador
  // desde el panel de Gestión de Usuarios (escribe en el documento de otro usuario).
  const setRole = useCallback(() => {}, []);

  return { role, setRole, userName, setUserName, canSelfSelectRole: false, profileLoading };
}

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const local = useLocalRole();
  const remote = useFirebaseRole();
  const active = isFirebaseConfigured ? remote : local;

  const permissions = useMemo(() => ROLE_PERMISSIONS[active.role], [active.role]);

  const value = useMemo(
    () => ({
      role: active.role,
      setRole: active.setRole,
      permissions,
      userName: active.userName,
      setUserName: active.setUserName,
      canSelfSelectRole: active.canSelfSelectRole,
      profileLoading: active.profileLoading,
    }),
    [active, permissions],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
