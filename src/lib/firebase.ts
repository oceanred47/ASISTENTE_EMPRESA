// Inicialización de Firebase (Firestore + Authentication).
//
// La app funciona en dos modos:
//  - "local": sin variables VITE_FIREBASE_* configuradas, todo se guarda en
//    localStorage del navegador (comportamiento original, sin sincronización
//    entre usuarios). Es el modo por defecto para no romper nada.
//  - "firebase": con la configuración presente, los expedientes y usuarios se
//    sincronizan en tiempo real vía Firestore, y el acceso requiere iniciar
//    sesión con Firebase Authentication.
//
// Los valores de firebaseConfig son públicos del lado del cliente (no son
// secretos) — lo que protege los datos son las Firestore Security Rules
// (ver firestore.rules), no ocultar esta configuración.

import { initializeApp, FirebaseApp } from 'firebase/app';
import { initializeFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  // Los TeaRecord tienen varios campos opcionales (fechaGestion, observaciones, etc.)
  // que suelen ser `undefined`; sin esto Firestore rechaza el documento entero.
  db = initializeFirestore(app, { ignoreUndefinedProperties: true });
  auth = getAuth(app);
}

export { app, db, auth };
