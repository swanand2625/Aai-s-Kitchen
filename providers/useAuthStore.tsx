import { create } from 'zustand';

type UserRole = 'super_admin' | 'franchise_admin' | 'mess_member';

type AuthState = {
  userId: string | null;
  role: UserRole | null;
  franchiseId: string | null; // optional if not used by all roles
  setUser: (userId: string, role: UserRole, franchiseId?: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  role: null,
  franchiseId: null,

  setUser: (userId, role, franchiseId = null) =>
    set({ userId, role, franchiseId }),

  logout: () =>
    set({ userId: null, role: null, franchiseId: null }),
}));