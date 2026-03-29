import { initializePurchases } from '@/constants/revenuecat';
import { AuthProvider } from '@/hooks/AuthContext';
import { Stack } from 'expo-router';
import * as SchermCapture from 'expo-screen-capture';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    SchermCapture.preventScreenCaptureAsync();
    if (process.env.NODE_ENV !== 'development') initializePurchases();
    return () => {
      SchermCapture.allowScreenCaptureAsync();
    };
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="inloggen" />
        <Stack.Screen name="registreren" />
        <Stack.Screen name="voorwaarden" />
        <Stack.Screen name="privacybeleid" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}