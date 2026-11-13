import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ROLES, Role } from '../types';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
  uid: string;
  userName: string;
  email: string;
  role: Role;
}

interface UserManagementModalProps {
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(
        snap.docs.map((d) => {
          const data = d.data() as { userName?: string; email?: string; role?: Role };
          return {
            uid: d.id,
            userName: data.userName || data.email || d.id,
            email: data.email || '',
            role: (ROLES as readonly string[]).includes(data.role ?? '') ? (data.role as Role) : 'Coordinador',
          };
        }),
      );
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const changeRole = async (uid: string, role: Role) => {
    if (!db) return;
    await setDoc(doc(db, 'users', uid), { role }, { merge: true });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold">Gestión de Usuarios y Roles</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-slate-500">Cargando usuarios…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-500">No hay usuarios registrados todavía.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold">Usuario</th>
                  <th className="px-3 py-2 font-semibold">Correo</th>
                  <th className="px-3 py-2 font-semibold">Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">
                      {u.userName}
                      {u.uid === user?.uid && <span className="ml-2 text-xs text-slate-400">(tú)</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{u.email}</td>
                    <td className="px-3 py-2">
                      <select
                        className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                        value={u.role}
                        onChange={(e) => changeRole(u.uid, e.target.value as Role)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
