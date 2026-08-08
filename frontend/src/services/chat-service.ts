import { apiClient } from "../api/client";
import type { ChatResponse } from "../types/chat/chat-response";
import type { CreateChatRequest } from "../types/chat/create-chat-request";
import type { MessageRequest } from "../types/chat/message-request";
import type { MessageResponse } from "../types/chat/message-response";
import type { ParticipantResponse } from "../types/chat/participant-response";
import type { PageResponse } from "../types/common/page-response";

export const chatService = {
    getMyChats: async (): Promise<PageResponse<ChatResponse>> => {
        try {
            return await apiClient.get<PageResponse<ChatResponse>>(
                "/chats/me"
            );
        } catch (error) {
            console.error("Getting my chats error:", error);
            throw error;
        }
    },

    getChat: async (id: number): Promise<ChatResponse> => {
        try {
            return await apiClient.get<ChatResponse>(
                `/chats/${id}`
            );
        } catch (error) {
            console.error("Getting chat error:", error);
            throw error;
        }
    },

    createChat: async (request: CreateChatRequest): Promise<ChatResponse> => {
        try {
            return await apiClient.post<ChatResponse>("/chats", request);
        } catch (error) {
            console.error("Creating chat error:", error);
            throw error;
        }
    },

    getMessagesFromChat: async (id: number, page: number = 0, limit: number = 30): Promise<PageResponse<MessageResponse>> => {
        try {
            return await apiClient.get<PageResponse<MessageResponse>>(
                `/chats/${id}/messages?page=${page}&limit=${limit}`
            );
        } catch (error) {
            console.error("Getting messages from chat error:", error);
            throw error;
        }
    },

    sendMessageToChat: async (id: number, request: MessageRequest): Promise<MessageResponse> => {
        try {
            return await apiClient.post<MessageResponse>(
                `/chats/${id}/messages`,
                request
            );
        } catch (error) {
            console.error("Send message to chat error:", error);
            throw error;
        }
    },

    inviteUserToChat: async (id: number, username: string) => {
        try {
            return await apiClient.post(
                `/chats/${id}/invite?username=${username}`
            );
        } catch (error) {
            console.error("Invite user to chat error:", error);
            throw error;
        }
    },

    getParticipantsFromChat: async (id: number): Promise<PageResponse<ParticipantResponse>> => {
        try {
            return await apiClient.get(`/chats/${id}/participants`);
        } catch (error) {
            console.error("Get participants from chat error:", error);
            throw error;
        }
    },

    exitChat: async (chatId: number) => {
        try {
            return await apiClient.delete(
                `/chats/${chatId}/exit`
            );
        } catch (error) {
            console.error("Exit chat error:", error);
            throw error;
        }
    }
};
