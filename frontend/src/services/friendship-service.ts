import { apiClient } from "../api/client";
import type { PageResponse } from "../types/common/page-response";
import type { FriendshipResponse } from "../types/friendship/friendship-response";

export const friendshipService = {
    getMyOnlineFriends: async (): Promise<PageResponse<FriendshipResponse>> => {
        try {
            return await apiClient.get<PageResponse<FriendshipResponse>>("/friendship/me/online");
        } catch (error) {
            console.error("Get online users error:", error);
            throw error;
        }
    },

    getMyFriends: async (): Promise<PageResponse<FriendshipResponse>> => {
        try {
            return await apiClient.get<PageResponse<FriendshipResponse>>(
                "/friendship/me",
            );
        } catch (error) {
            console.error("Getting friends error:", error);
            throw error;
        }
    },

    getMyOutgoingInvites: async (): Promise<
        PageResponse<FriendshipResponse>
    > => {
        try {
            return await apiClient.get<PageResponse<FriendshipResponse>>(
                "/friendship/me/invitations/outgoing",
            );
        } catch (error) {
            console.error("Getting outgoing invitations error:", error);
            throw error;
        }
    },

    getMyIncomingInvites: async (): Promise<
        PageResponse<FriendshipResponse>
    > => {
        try {
            return await apiClient.get<PageResponse<FriendshipResponse>>(
                "/friendship/me/invitations/incoming",
            );
        } catch (error) {
            console.error("Getting incoming invitations error:", error);
            throw error;
        }
    },

    inviteAsFriendByUsername: async (
        username: string,
    ): Promise<FriendshipResponse> => {
        try {
            return apiClient.post<FriendshipResponse>(
                `/friendship/me/invite/usr?username=${username}`,
            );
        } catch (error) {
            console.error("Inviting as friend error:", error);
            throw error;
        }
    },

    inviteAsFriend: async (accountId: number): Promise<FriendshipResponse> => {
        try {
            return apiClient.post<FriendshipResponse>(
                `/friendship/me/invite?id=${accountId}`,
            );
        } catch (error) {
            console.error("Inviting as friend error:", error);
            throw error;
        }
    },

    removeFromFriend: async (accountId: number) => {
        try {
            return apiClient.delete(`/friendship/me/remove/${accountId}`);
        } catch (error) {
            console.error("Inviting as friend error:", error);
            throw error;
        }
    },
};
