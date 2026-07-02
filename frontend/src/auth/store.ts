import { create } from "zustand";

interface AuthState {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    setAccessToken: (token) => set({ accessToken: token }),
    isLoading: true,
    setLoading: (loading) => set({ isLoading: loading }),
    clearAuth: () => set({ accessToken: null }),
}));
