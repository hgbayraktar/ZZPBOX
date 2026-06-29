import { initializePurchases } from '@/constants/revenuecat';
import { AuthProvider } from '@/hooks/AuthContext';
import { gebruikPakket } from '@/hooks/gebruikData';
import { Stack } from 'expo-router';
import * as SchermCapture from 'expo-screen-capture';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Initialize RevenueCat immediately (before any component mounts)
initializePurchases();

function AppInhoud() {
  const pakket = gebruikPakket();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      requestTrackingPermissionsAsync();
    }
  }, []);

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
      <Stack.Screen name="handleiding" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppInhoud />
    </AuthProvider>
  );
}
