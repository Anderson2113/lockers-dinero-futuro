import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/app-store';
import { useLockers } from '../../hooks/useLockers';
import { useEmpresa } from '../../hooks/useEmpresa';
import { createRegistro } from '../../services/firestore-service';
import { CreateRegistroInput } from '@gma-lockers/shared';
import PackageForm from '../../components/PackageForm';
import { useRouter } from 'expo-router';

export default function IngresarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { tenantId, empresa } = useAppStore();
  const { lockers } = useLockers();
  const { empresaLive } = useEmpresa();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSave = async (input: CreateRegistroInput) => {
    if (!tenantId) return;
    try {
      const timeout = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => reject(new Error('Tiempo de espera agotado de 5s (Timeout).')), 5000);
      });

      await Promise.race([
        createRegistro(tenantId, input),
        timeout
      ]);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      Alert.alert('Éxito', t('packageForm.success'));
      router.back();
    } catch (error: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (error?.message === 'LOCKER_OCCUPIED') {
        Alert.alert('Casillero Ocupado', 'Este casillero ya fue asignado simultáneamente. Intente de nuevo.');
      } else {
        Alert.alert('Error', `No se pudo guardar el paquete: ${error?.message || error}`);
      }
      console.error(error);
    }
  };

  // Buscar primer locker libre
  const buscarLockerLibre = () => {
    if (!empresa) return null;
    const ocupados = new Set(lockers.map(r => r.numero_locker));
    for (let i = 1; i <= empresa.cantidad_lockers; i++) {
      if (!ocupados.has(i)) return i;
    }
    return null;
  };

  const libre = buscarLockerLibre();

  const activeEmpresa = empresaLive || empresa;
  let diasRestantes = 999;
  if (activeEmpresa?.fecha_vencimiento) {
    const hoy = new Date();
    let venci = activeEmpresa.fecha_vencimiento;
    if ((venci as any).toDate) {
      venci = (venci as any).toDate();
    } else {
      venci = new Date(venci);
    }
    diasRestantes = Math.ceil((venci.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }
  const isBlocked = !activeEmpresa?.estado_suscripcion || diasRestantes < 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>{t('tabs.ingresar')}</Text>
        
        {isBlocked ? (
          <View style={styles.fullBox}>
            <Text style={styles.fullText}>Servicio Suspendido. Comunícate con el administrador para reactivar y poder registrar paquetes.</Text>
          </View>
        ) : libre ? (
          <PackageForm 
            numeroLocker={libre}
            onSave={handleSave}
            onCancel={() => router.back()}
          />
        ) : (
          <View style={styles.fullBox}>
            <Text style={styles.fullText}>{t('packageForm.noLockers')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  fullBox: {
    backgroundColor: '#3A3A3C',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  fullText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
