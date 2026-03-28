import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4f969nNswvLsl0U0BC1rZYeIDOIIf1kA",
  authDomain: "zzpbox-b2d23.firebaseapp.com",
  projectId: "zzpbox-b2d23",
  storageBucket: "zzpbox-b2d23.firebasestorage.app",
  messagingSenderId: "438328082559",
  appId: "1:438328082559:ios:8fe1a15eaacbe7945f7f4a"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);