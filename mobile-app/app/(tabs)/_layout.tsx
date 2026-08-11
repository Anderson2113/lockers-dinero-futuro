import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import OfflineBanner from '../../components/OfflineBanner';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../stores/app-store';
import { useEmpresa } from '../../hooks/useEmpresa';

export default function TabsLayout() {
  const { tenantId } = useAppStore();
  const { empresaLive, daysUntilExpiration } = useEmpresa();
  const { t } = useTranslation();

  if (!tenantId) {
    return <Redirect href="/login" />;
  }

  // Check if blocked
  const isExpired = daysUntilExpiration !== null && daysUntilExpiration < 0;
  const isSuspended = empresaLive && !empresaLive.estado_suscripcion;
  
  if (isExpired || isSuspended) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="lock-closed" size={64} color="#FF3B30" style={{ marginBottom: 20 }} />
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>Servicio Suspendido</Text>
        <Text style={{ color: '#8E8E93', fontSize: 16, textAlign: 'center' }}>
          Su plan de uso {isExpired ? 'ha expirado' : 'ha sido suspendido'}. Por favor contacte al administrador para renovar su servicio.
        </Text>
      </View>
    );
  }

  const showWarning = daysUntilExpiration !== null && daysUntilExpiration <= 2 && daysUntilExpiration >= 0;

  return (
    <View style={styles.container}>
      <OfflineBanner />
      {showWarning && (
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#FF9500' }}>
          <View style={{ padding: 10, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              ⚠️ Su servicio expirará en {daysUntilExpiration} día(s).
            </Text>
          </View>
        </SafeAreaView>
      )}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1C1C1E',
            borderTopColor: '#3A3A3C',
          },
          tabBarActiveTintColor: '#0A84FF',
          tabBarInactiveTintColor: '#8E8E93',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="ingresar"
          options={{
            title: t('tabs.ingresar'),
            tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="retirar"
          options={{
            title: t('tabs.retirar'),
            tabBarIcon: ({ color }) => <Ionicons name="qr-code-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="historial"
          options={{
            title: t('tabs.historial'),
            tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  }
});
