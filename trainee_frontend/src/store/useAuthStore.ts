import { create } from 'zustand';

type Role = 'user' | 'admin';

interface AuthState {
    role: Role;
    setRole: (r: Role) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    role: 'user',
    setRole: (r) => set({ role: r}),
}));