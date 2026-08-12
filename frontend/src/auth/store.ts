import { create } from "zustand";

interface AuthState {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    accountId: number | null;
    setAccountId: (accountId: number | null) => void;
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    setAccessToken: (token) => set({ accessToken: token }),
    accountId: null,
    setAccountId: (accountId) => set({ accountId: accountId }),
    isLoading: true,
    setLoading: (loading) => set({ isLoading: loading }),
    clearAuth: () => set({ accessToken: null }),
}));
