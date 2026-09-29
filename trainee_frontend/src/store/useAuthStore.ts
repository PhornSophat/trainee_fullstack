import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'user' | 'admin';

interface AuthState {
    role: Role;
    setRole: (r: Role) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            role: 'user',
            setRole: (r) => set({ role: r }),
        }),
        {
            name: 'app_auth_role',
        }
    )
);