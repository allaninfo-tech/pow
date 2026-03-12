// Firebase SDK — Storage only.
// We do NOT use Firebase Auth (Supabase handles all auth).
// Analytics is initialised lazily on the client only to avoid SSR crashes.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Guard against duplicate initialization on Next.js hot reloads
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const storage = getStorage(app);

// Analytics: only import & init on the client (browser), never on the server.
// Usage: const analytics = await getFirebaseAnalytics();
export async function getFirebaseAnalytics() {
    if (typeof window === 'undefined') return null;
    const { getAnalytics } = await import('firebase/analytics');
    return getAnalytics(app);
}
