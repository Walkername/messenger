import { apiClient } from "../api/client";
import type { ProfileResponse } from "../types/profile/profile-response";
import type { UpdateFirstNameRequest } from "../types/profile/update-firstname-request";
import type { UpdateUsernameRequest } from "../types/profile/update-username-request";

export const profileService = {
    getProfile: async (id: number): Promise<ProfileResponse> => {
        try {
            return await apiClient.get<ProfileResponse>(`/profiles/${id}`);
        } catch (error) {
            console.error("Getting profile error:", error);
            throw error;
        }
    },

    getMyProfile: async (): Promise<ProfileResponse> => {
        try {
            return await apiClient.get<ProfileResponse>("/profiles/me");
        } catch (error) {
            console.error("Get my profile error:", error);
            throw error;
        }
    },

    updateMyProfileFirstName: async (request: UpdateFirstNameRequest): Promise<ProfileResponse> => {
        try {
            return await apiClient.patch("/profiles/me/firstname", request);
        } catch (error) {
            console.error("Update profile firstname error:", error);
            throw error;
        }
    },

    updateMyProfileUsername: async (request: UpdateUsernameRequest): Promise<ProfileResponse> => {
        try {
            return await apiClient.patch("/profiles/me/username", request);
        } catch (error) {
            console.error("Update profile username error:", error);
            throw error;
        }
    },
};
