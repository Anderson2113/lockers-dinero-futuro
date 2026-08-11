import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { RegistroLocker } from '@gma-lockers/shared';
import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge';

interface Props {
  registros: RegistroLocker[];
  onSelect: (registro: RegistroLocker) => void;
}

export default function ManualSearch({ registros, onSelect }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filtered = registros.filter(r => 
    r.nombre_cliente.toLowerCase().includes(query.toLowerCase()) || 
    r.codigo_manual.toLowerCase().includes(query.toLowerCase()) ||
    r.numero_locker.toString() === query
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t('retire.searchPlaceholder')}
        placeholderTextColor="#8E8E93"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id_registro}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
            <View>
              <Text style={styles.name}>{item.nombre_cliente}</Text>
              <Text style={styles.sub}>Locker #{item.numero_locker} • {item.codigo_manual}</Text>
            </View>
            <StatusBadge status={item.estado_pago} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('retire.notFound')}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#FFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
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
  name: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sub: {
    color: '#8E8E93',
    marginTop: 4,
  },
  empty: {
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 20,
  }
});
