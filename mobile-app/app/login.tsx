import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../stores/app-store';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login, loading } = useAuth();
  const setTenantInfo = useAppStore(state => state.setTenantInfo);
  
  const [codigo, setCodigo] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const res = await login(codigo, pin);
    if (res.success && res.tenantId && res.tenantData) {
      setTenantInfo(res.tenantId, {
        id_empresa: res.tenantId,
        ...res.tenantData,
      } as any);
      router.replace('/(tabs)');
    } else {
      setError(res.error || t('login.error'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('login.title')}</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder={t('login.companyCode')}
          placeholderTextColor="#8E8E93"
          autoCapitalize="characters"
          value={codigo}
          onChangeText={setCodigo}
        />
        <TextInput
          style={styles.input}
          placeholder={t('login.pin')}
          placeholderTextColor="#8E8E93"
          secureTextEntry
          keyboardType="numeric"
          value={pin}
          onChangeText={setPin}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{t('login.submit')}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#1C1C1E',
    width: '100%',
    padding: 24,
    borderRadius: 24,
  },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0A84FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  }
});
