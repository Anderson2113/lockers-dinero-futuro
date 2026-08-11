import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Empresa } from '@gma-lockers/shared';

interface AppState {
  tenantId: string | null;
  empresa: Empresa | null;
  isOnline: boolean;
  _hasHydrated: boolean;
  setTenantInfo: (tenantId: string, empresa: Empresa) => void;
  setOnlineStatus: (status: boolean) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tenantId: null,
      empresa: null,
      isOnline: true,
      _hasHydrated: false,
      setTenantInfo: (tenantId, empresa) => set({ tenantId, empresa }),
      setOnlineStatus: (status) => set({ isOnline: status }),
      logout: () => set({ tenantId: null, empresa: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'gma-lockers-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tenantId: state.tenantId, empresa: state.empresa }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[Zustand] Error al rehidratar sesión desde AsyncStorage:', error);
        }
        // Mark hydration complete whether or not there was an error
        useAppStore.getState().setHasHydrated(true);
      },
    }
  )
);
