import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EstadoPago } from '@gma-lockers/shared';

interface Props {
  status: EstadoPago;
}

export default function StatusBadge({ status }: Props) {
  const { t } = useTranslation();
  
  const isPaid = status === 'Pagado';
  const bgColor = isPaid ? '#34C759' : '#FF9500';
  const label = isPaid ? t('packageForm.paid') : t('packageForm.pending');

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
