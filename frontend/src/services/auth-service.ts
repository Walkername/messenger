import type { AuthRequest } from "../types/auth/auth-request";
import type { JWTResponse } from "../types/auth/jwt-response";
import { apiClient } from "../api/client";
import { useAuthStore } from "../auth/store";
import type { AuthResponse } from "../types/auth/auth-response";
import getClaimFromToken from "../utils/token-validation";

export const authService = {
    login: async (request: AuthRequest): Promise<JWTResponse> => {
        try {
            const response = await apiClient.post<JWTResponse>(
                "/auth/login",
                request,
            );

            useAuthStore.getState().setAccessToken(response.accessToken);
            const accountId = getClaimFromToken(response.accessToken, "id");
            useAuthStore.getState().setAccountId(accountId);

            return response;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    register: async (request: AuthRequest): Promise<AuthResponse> => {
        try {
            const response = await apiClient.post<AuthResponse>(
                "/auth/register",
                request,
            );
            return response;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            await apiClient.post(
                "/auth/logout",
                {},
                { credentials: "include" },
            );
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            useAuthStore.getState().clearAuth();
        }
    },

    isAuthenticated: (): boolean => {
        const token = useAuthStore.getState().accessToken;
        return !!token;
    },

    getToken: (): string | null => {
        return useAuthStore.getState().accessToken;
    },

    getAccountId: (): number | null => {
        return useAuthStore.getState().accountId;
    },
};
