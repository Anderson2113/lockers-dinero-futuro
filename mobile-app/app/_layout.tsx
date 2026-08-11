import { Stack as ExpoStack } from 'expo-router';
import '../locales/i18n'; // Iniciar traducciones
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '../stores/app-store';

export default function RootLayout() {
  const _hasHydrated = useAppStore((s) => s._hasHydrated);

  // Wait for Zustand to rehydrate from AsyncStorage before rendering anything.
  // This prevents native crashes caused by accessing state before storage is ready.
  if (!_hasHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  return (
    <ExpoStack screenOptions={{ headerShown: false }}>
      <ExpoStack.Screen name="(tabs)" />
      <ExpoStack.Screen name="login" options={{ presentation: 'modal' }} />
    </ExpoStack>
  );
}
