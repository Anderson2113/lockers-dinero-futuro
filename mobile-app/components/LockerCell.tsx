import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { RegistroLocker } from '@gma-lockers/shared';

interface Props {
  numeroLocker: number;
  registro?: RegistroLocker; // Si no hay registro, está libre
  onPress: () => void;
}

export default function LockerCell({ numeroLocker, registro, onPress }: Props) {
  // Determinación de color: 
  // Verde: Libre (#34C759)
  // Rojo: Ocupado (#FF3B30)
  // Naranja: Atrasado (#FF9500)
  
  let bgColor = '#34C759'; // Libre por defecto
  let statusText = 'Libre';
  
  if (registro) {
    if (registro.estado_paquete === 'Atrasado') {
      bgColor = '#FF9500';
      statusText = 'Atrasado';
    } else {
      bgColor = '#FF3B30';
      statusText = 'Ocupado';
    }
  }

  return (
    <TouchableOpacity 
      style={[styles.cell, { backgroundColor: bgColor }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.number}>{numeroLocker}</Text>
      <View style={styles.statusContainer}>
         <Text style={styles.status}>{statusText}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5, // Android
  },
  number: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  status: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});
