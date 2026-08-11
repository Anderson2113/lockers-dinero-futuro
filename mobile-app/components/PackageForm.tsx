import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CreateRegistroInput, generateCodigoManual, generateCodigoQR } from '@gma-lockers/shared';

interface Props {
  numeroLocker: number;
  onSave: (registro: CreateRegistroInput) => Promise<void>;
  onCancel: () => void;
}

export default function PackageForm({ numeroLocker, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contenido, setContenido] = useState('');
  const [estadoPago, setEstadoPago] = useState<'Pagado' | 'Pendiente'>('Pendiente');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Faltan datos', 'Por favor ingresa el nombre del cliente');
      return;
    }
    if (!telefono.trim()) {
      Alert.alert('Faltan datos', 'Por favor ingresa el número de celular');
      return;
    }
    if (!contenido.trim()) {
      Alert.alert('Faltan datos', 'Por favor ingresa el contenido del paquete');
      return;
    }
    
    setLoading(true);
    try {
      const input: CreateRegistroInput = {
        numero_locker: numeroLocker,
        nombre_cliente: nombre,
        telefono_cliente: telefono,
        contenido,
        estado_pago: estadoPago,
        codigo_qr: generateCodigoQR(),
        codigo_manual: generateCodigoManual(),
      };
      
      await onSave(input);
    } catch (error: any) {
      Alert.alert('Error', `Ocurrió un error inesperado al preparar el paquete: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('packageForm.title')} - Locker #{numeroLocker}</Text>
      
      <TextInput
        style={styles.input}
        placeholder={t('packageForm.clientName')}
        placeholderTextColor="#8E8E93"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder={t('packageForm.phone')}
        placeholderTextColor="#8E8E93"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />
      <TextInput
        style={styles.input}
        placeholder={t('packageForm.content')}
        placeholderTextColor="#8E8E93"
        value={contenido}
        onChangeText={setContenido}
      />

      <Text style={styles.label}>{t('packageForm.paymentStatus')}</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleOption, estadoPago === 'Pendiente' && styles.toggleActive]}
          onPress={() => setEstadoPago('Pendiente')}
        >
          <Text style={[styles.toggleText, estadoPago === 'Pendiente' && styles.toggleActiveText]}>
            {t('packageForm.pending')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleOption, estadoPago === 'Pagado' && styles.toggleActive]}
          onPress={() => setEstadoPago('Pagado')}
        >
          <Text style={[styles.toggleText, estadoPago === 'Pagado' && styles.toggleActiveText]}>
            {t('packageForm.paid')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
          <Text style={styles.cancelText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>{t('packageForm.save')}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    padding: 24,
    borderRadius: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3A3A3C',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#0A84FF',
    marginLeft: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: '#0A84FF',
  },
  toggleText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleActiveText: {
    color: '#FFF',
  }
});
