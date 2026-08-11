import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '../stores/app-store';

export const useNetworkStatus = () => {
  const { isOnline, setOnlineStatus } = useAppStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnlineStatus(!!state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, [setOnlineStatus]);

  return isOnline;
};
