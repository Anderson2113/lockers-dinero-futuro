import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import LockerCell from './LockerCell';
import { RegistroLocker } from '@gma-lockers/shared';
import { useTranslation } from 'react-i18next';

interface Props {
  totalLockers: number;
  registros: RegistroLocker[];
  onLockerPress: (numeroLocker: number, registro?: RegistroLocker) => void;
}

export default function LockerGrid({ totalLockers, registros, onLockerPress }: Props) {
  const { t } = useTranslation();

  // Crear array de 1 hasta totalLockers
  let lockers: (number | null)[] = Array.from({ length: totalLockers }, (_, i) => i + 1);
  
  // Padding para que siempre sea múltiplo de 3 y no se rompa el flex wrap
  const remainder = totalLockers % 3;
  if (remainder !== 0) {
    const pad = 3 - remainder;
    lockers = lockers.concat(Array(pad).fill(null));
  }

  if (totalLockers === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('home.empty')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={lockers}
      keyExtractor={(item, index) => item ? item.toString() : `empty-${index}`}
      numColumns={3}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => {
        if (item === null) {
          return <View style={[styles.cell, { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]} />;
        }
        
        const registro = registros.find(r => r.numero_locker === item);
        return (
          <LockerCell 
            numeroLocker={item} 
            registro={registro} 
            onPress={() => onLockerPress(item, registro)} 
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 10,
    paddingBottom: 40,
  },
  cell: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  }
});
