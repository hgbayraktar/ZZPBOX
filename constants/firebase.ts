import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCnKJ89CRL9wX4dVx5I9_XxZ2Unu_OpKaA",
  authDomain: "zzpbox-b2d23.firebaseapp.com",
  projectId: "zzpbox-b2d23",
  storageBucket: "zzpbox-b2d23.firebasestorage.app",
  messagingSenderId: "438328082559",
  appId: "1:438328082559:web:f7f948ab2b8043dd5f7f4a"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// getReactNativePersistence is resolved by Metro's React Native bundle at runtime
const { getReactNativePersistence } = require('firebase/auth') as { getReactNativePersistence: (s: typeof AsyncStorage) => any };

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e: any) {
  if (e.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw e;
  }
}

const db = getFirestore(app);

export { app, auth, db };
