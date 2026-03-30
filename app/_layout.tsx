import { initializePurchases } from '@/constants/revenuecat';
import { AuthProvider } from '@/hooks/AuthContext';
import { gebruikPakket } from '@/hooks/gebruikData';
import { Stack } from 'expo-router';
import * as SchermCapture from 'expo-screen-capture';
import { useEffect } from 'react';

function AppInhoud() {
  const pakket = gebruikPakket();

  useEffect(() => {
    if (pakket === 'premium') {
      SchermCapture.allowScreenCaptureAsync();
    } else {
      SchermCapture.preventScreenCaptureAsync();
    }
  }, [pakket]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="inloggen" />
      <Stack.Screen name="registreren" />
      <Stack.Screen name="voorwaarden" />
      <Stack.Screen name="privacybeleid" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') initializePurchases();
  }, []);

  return (
    <AuthProvider>
      <AppInhoud />
    </AuthProvider>
  );
}
