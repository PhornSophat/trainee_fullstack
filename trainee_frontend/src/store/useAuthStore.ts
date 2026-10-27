import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Role = 'user' | 'admin';

interface AuthState {
    role: Role;
    setRole: (r: Role) => void;
}

const getInitialRole = (): Role => {
    if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.startsWith('/admin') || path.startsWith('/training-eg')) {
            return 'admin';
        }
    }
    return 'user';
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            role: getInitialRole(),
            setRole: (r) => set({ role: r }),
        }),
        {
            name: 'app_auth_role',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);