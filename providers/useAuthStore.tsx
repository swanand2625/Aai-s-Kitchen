import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserRole = 'super_admin' | 'franchise_admin' | 'mess_member';

type AuthState = {
  userId: string | null;
  role: UserRole | null;
  franchiseId: string | null;
  setUser: (userId: string, role: UserRole, franchiseId?: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      role: null,
      franchiseId: null,
      setUser: (userId, role, franchiseId = null) =>
        set({ userId, role, franchiseId }),
      logout: () => set({ userId: null, role: null, franchiseId: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage), // ✅ this is the fix
    }
  )
);
