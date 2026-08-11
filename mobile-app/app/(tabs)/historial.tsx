import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { db } from '../../services/firebase';
import { useAppStore } from '../../stores/app-store';
import { RegistroLocker, FIRESTORE_COLLECTIONS } from '@gma-lockers/shared';

export default function HistorialScreen() {
  const { t } = useTranslation();
  const { tenantId } = useAppStore();
  const [historial, setHistorial] = useState<RegistroLocker[]>([]);
  const [filter, setFilter] = useState<'Todos' | 'Activo' | 'Recogido'>('Todos');

  useEffect(() => {
    if (!tenantId) return;

    // Obtener últimos 50 registros
    const unsubscribe = db.collection(FIRESTORE_COLLECTIONS.EMPRESAS)
      .doc(tenantId)
      .collection(FIRESTORE_COLLECTIONS.REGISTROS_LOCKERS)
      .orderBy('fecha_ingreso', 'desc')
      .limit(50)
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as RegistroLocker);
        setHistorial(data);
      });

    return () => unsubscribe();
  }, [tenantId]);

  const filteredData = historial.filter(item => filter === 'Todos' || item.estado_paquete === filter);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('tabs.historial')}</Text>
      
      <View style={styles.filterContainer}>
        {(['Todos', 'Activo', 'Recogido'] as const).map(f => (
          <TouchableOpacity 
            key={f}
            style={[styles.filterBtn, filter === f && styles.activeFilterBtn]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id_registro}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Text style={styles.name}>{item.nombre_cliente}</Text>
              <Text style={styles.sub}>
                Locker #{item.numero_locker} • {item.fecha_ingreso ? new Date((item.fecha_ingreso as any).toDate ? (item.fecha_ingreso as any).toDate() : item.fecha_ingreso).toLocaleString() : ''}
              </Text>
              <Text style={[styles.paymentText, { color: item.estado_pago === 'Pagado' ? '#34C759' : '#FF9500' }]}>
                {item.estado_pago === 'Pagado' ? '✅ Pagado' : '⚠️ Pendiente'}
              </Text>
            </View>
            <View style={styles.badgeContainer}>
               <Text style={[
                 styles.badge, 
                 { color: item.estado_paquete === 'Recogido' ? '#34C759' : '#0A84FF' }
               ]}>
                 {item.estado_paquete}
               </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeFilterBtn: {
    backgroundColor: '#3A3A3C',
  },
  filterText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFF',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sub: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
  },
  paymentText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  badgeContainer: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badge: {
    fontWeight: 'bold',
    fontSize: 12,
  }
});
