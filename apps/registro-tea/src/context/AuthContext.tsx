import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

interface AuthContextValue {
  isFirebaseConfigured: boolean;
  user: FirebaseUser | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInEmail = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase no está configurado.');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpEmail = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase no está configurado.');
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInGoogle = async () => {
    if (!auth) throw new Error('Firebase no está configurado.');
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const signOutUser = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({ isFirebaseConfigured, user, loading, signInEmail, signUpEmail, signInGoogle, signOutUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
