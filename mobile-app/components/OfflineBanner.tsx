import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('common.offline')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF3B30',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
