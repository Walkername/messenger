import { apiClient } from "../api/client";
import type { PageResponse } from "../types/common/page-response";
import type { FriendResponse, IncomingRequestResponse, OutgoingRequestResponse } from "../types/friendship/friendship";

export const friendshipService = {
    getMyOnlineFriends: async (): Promise<PageResponse<FriendResponse>> => {
        try {
            return await apiClient.get<PageResponse<FriendResponse>>("/friendship/me/online");
        } catch (error) {
            console.error("Get online users error:", error);
            throw error;
        }
    },

    getMyFriends: async (page: number = 0, limit: number = 20): Promise<PageResponse<FriendResponse>> => {
        try {
            return await apiClient.get<PageResponse<FriendResponse>>(
                `/friendship/me?page=${page}&limit=${limit}`,
            );
        } catch (error) {
            console.error("Getting friends error:", error);
            throw error;
        }
    },

    getMyOutgoingInvites: async (): Promise<
        PageResponse<OutgoingRequestResponse>
    > => {
        try {
            return await apiClient.get<PageResponse<OutgoingRequestResponse>>(
                "/friendship/me/invitations/outgoing",
            );
        } catch (error) {
            console.error("Getting outgoing invitations error:", error);
            throw error;
        }
    },

    getMyIncomingInvites: async (): Promise<
        PageResponse<IncomingRequestResponse>
    > => {
        try {
            return await apiClient.get<PageResponse<IncomingRequestResponse>>(
                "/friendship/me/invitations/incoming",
            );
        } catch (error) {
            console.error("Getting incoming invitations error:", error);
            throw error;
        }
    },

    inviteAsFriendByUsername: async (
        username: string,
    ): Promise<FriendResponse> => {
        try {
            return apiClient.post<FriendResponse>(
                `/friendship/me/invite/usr?username=${username}`,
            );
        } catch (error) {
            console.error("Inviting as friend error:", error);
            throw error;
        }
    },

    inviteAsFriend: async (accountId: number): Promise<FriendResponse> => {
        try {
            return apiClient.post<FriendResponse>(
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
