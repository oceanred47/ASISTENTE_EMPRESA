import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const friendlyError = (err: unknown): string => {
    const code = (err as { code?: string })?.code ?? '';
    if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
      return 'Correo o contraseña incorrectos.';
    }
    if (code.includes('email-already-in-use')) return 'Ya existe una cuenta con ese correo.';
    if (code.includes('weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (code.includes('invalid-email')) return 'Correo electrónico inválido.';
    return 'Ocurrió un error. Intenta de nuevo.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') await signInEmail(email, password);
      else await signUpEmail(email, password);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInGoogle();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-6 space-y-5">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">Gobierno de Puerto Rico · Departamento de la Familia</p>
          <h1 className="text-lg font-bold mt-1">Registro TEA · Ley 163-2024</h1>
          <p className="text-sm text-slate-500 mt-1">{mode === 'signin' ? 'Inicia sesión para continuar' : 'Crea tu cuenta de acceso'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Correo electrónico"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Contraseña"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2 rounded-md bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold"
          >
            {mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
          o
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full py-2 rounded-md border border-slate-300 dark:border-slate-700 disabled:opacity-50 text-sm font-semibold"
        >
          Continuar con Google
        </button>

        <p className="text-center text-sm text-slate-500">
          {mode === 'signin' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={() => {
              setError(null);
              setMode(mode === 'signin' ? 'signup' : 'signin');
            }}
            className="text-blue-700 dark:text-blue-400 font-semibold hover:underline"
          >
            {mode === 'signin' ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </p>
      </div>
    </div>
  );
};
