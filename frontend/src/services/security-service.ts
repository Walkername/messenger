import { apiClient } from "../api/client";
import type { PasswordUpdateRequest } from "../types/security/security";

export const securityService = {
    updatePassword: async (request: PasswordUpdateRequest) => {
        try {
            return await apiClient.patch("/security/password", request);
        } catch (error) {
            console.error("Update password error:", error);
            throw error;
        }
    },
};
