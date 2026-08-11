import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLockers } from '../../hooks/useLockers';
import { useAppStore } from '../../stores/app-store';
import { useEmpresa } from '../../hooks/useEmpresa';
import LockerGrid from '../../components/LockerGrid';
import { RegistroLocker } from '@gma-lockers/shared';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { lockers, loading } = useLockers();
  const { empresa, logout } = useAppStore();
  const { empresaLive } = useEmpresa();

  const handleLockerPress = (numeroLocker: number, registro?: RegistroLocker) => {
    console.log("Pressed locker:", numeroLocker, "Status:", registro ? "Occupied" : "Free");
  };

  const handleLogout = () => {
    logout();
  };

  if (loading || !empresa) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  // Lógica de Suscripción
  const activeEmpresa = empresaLive || empresa;
  let diasRestantes = 999;
  if (activeEmpresa.fecha_vencimiento) {
    const hoy = new Date();
    let venci = activeEmpresa.fecha_vencimiento;
    if ((venci as any).toDate) {
      venci = (venci as any).toDate();
    } else {
      venci = new Date(venci);
    }
    diasRestantes = Math.ceil((venci.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  const isSuspended = !activeEmpresa.estado_suscripcion;
  const isExpired = diasRestantes < 0;
  const isWarning = diasRestantes <= 2 && diasRestantes >= 0;

  const isBlocked = isSuspended || isExpired;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{activeEmpresa.nombre_negocio || activeEmpresa.nombre_empresa || 'GMA Lockers'}</Text>
          <Text style={styles.subtitle}>{t('tabs.home')}</Text>
        </View>
        <Text onPress={handleLogout} style={{color: '#FF3B30', fontSize: 16, fontWeight: 'bold'}}>Salir</Text>
      </View>

      {isBlocked ? (
        <View style={styles.blockedBanner}>
          <Text style={styles.blockedTitle}>⚠️ SERVICIO SUSPENDIDO</Text>
          <Text style={styles.blockedText}>
            {isExpired 
              ? 'La suscripción de este local ha expirado.' 
              : 'El servicio ha sido desactivado por el administrador.'}
            {'\n'}Comunícate con soporte para reactivar el sistema.
          </Text>
        </View>
      ) : isWarning ? (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Tu suscripción vence en {diasRestantes} día(s).
          </Text>
        </View>
      ) : null}
      
      <View style={{ flex: 1, opacity: isBlocked ? 0.3 : 1 }} pointerEvents={isBlocked ? 'none' : 'auto'}>
        <LockerGrid 
          totalLockers={activeEmpresa.cantidad_lockers}
          registros={lockers}
          onLockerPress={handleLockerPress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  warningBanner: {
    backgroundColor: '#FFCC00',
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  warningText: {
    color: '#000',
    fontWeight: 'bold',
  },
  blockedBanner: {
    backgroundColor: '#FF3B30',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  blockedTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  blockedText: {
    color: '#FFF',
    textAlign: 'center',
  }
});
