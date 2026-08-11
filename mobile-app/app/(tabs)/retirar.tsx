import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLockers } from '../../hooks/useLockers';
import { useAppStore } from '../../stores/app-store';
import { markAsPickedUp } from '../../services/firestore-service';
import QRScanner from '../../components/QRScanner';
import ManualSearch from '../../components/ManualSearch';
import { RegistroLocker } from '@gma-lockers/shared';

export default function RetirarScreen() {
  const { t } = useTranslation();
  const { lockers } = useLockers();
  const { tenantId } = useAppStore();
  
  const [mode, setMode] = useState<'scan' | 'manual'>('manual');
  const [isScanning, setIsScanning] = useState(false);

  const handleRetire = async (registro: RegistroLocker) => {
    if (!tenantId) return;
    
    const isPending = registro.estado_pago === 'Pendiente';
    const isDelayed = registro.estado_paquete === 'Atrasado' && registro.monto_penalizacion > 0;
    
    let message = `📦 Extraer del Locker N° ${registro.numero_locker}\n`;
    if (isDelayed) {
      message += `\n🚨 PAQUETE ATRASADO: Debes cobrar una penalización de $${registro.monto_penalizacion.toFixed(2)} extra.\n`;
    }
    if (isPending) {
      message += `\n⚠️ Este paquete está PENDIENTE DE PAGO. Por favor cobra el monto base antes de entregarlo.\n`;
    }
    message += `\n¿Confirmas la entrega a ${registro.nombre_cliente}?`;

    Alert.alert(
      t('retire.markPickedUp'),
      message,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          style: 'default',
          onPress: async () => {
            try {
              await markAsPickedUp(tenantId, registro.id_registro);
              Alert.alert('Éxito', t('retire.success'));
            } catch (error) {
              Alert.alert('Error', 'No se pudo registrar el retiro');
            }
          }
        }
      ]
    );
  };

  const handleScan = (data: string) => {
    setIsScanning(false);
    const found = lockers.find(l => l.codigo_qr === data);
    if (found) {
      handleRetire(found);
    } else {
      Alert.alert('Error', t('retire.notFound'));
    }
  };

  if (isScanning) {
    return <QRScanner onScan={handleScan} onCancel={() => setIsScanning(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('retire.title')}</Text>
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, mode === 'manual' && styles.activeToggle]}
            onPress={() => setMode('manual')}
          >
            <Text style={[styles.toggleText, mode === 'manual' && styles.activeToggleText]}>
              {t('retire.manualSearch')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, mode === 'scan' && styles.activeToggle]}
            onPress={() => setIsScanning(true)}
          >
            <Text style={[styles.toggleText, mode === 'scan' && styles.activeToggleText]}>
              {t('retire.scanQR')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ManualSearch registros={lockers} onSelect={handleRetire} />
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: '#3A3A3C',
  },
  toggleText: {
    color: '#8E8E93',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#FFF',
  }
});
