import { create } from 'zustand';

interface AdminState {
  adminEmail: string | null;
  setAdminEmail: (email: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  adminEmail: null,
  setAdminEmail: (email) => set({ adminEmail: email })
}));
