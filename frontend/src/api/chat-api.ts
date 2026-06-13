import type { ChatResponse } from "../types/chat/chat-response";
import type { CreateChatRequest } from "../types/chat/create-chat-request";
import type { MessageRequest } from "../types/chat/message-request";
import type { MessageResponse } from "../types/chat/message-response";
import type { ParticipantResponse } from "../types/chat/participant-response";
import type { PageResponse } from "../types/common/page-response";
import customRequest from "./custom-request";

export const getMyChats = async (): Promise<PageResponse<ChatResponse>> => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/chats/me`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );
    return await response.json() as PageResponse<ChatResponse>;
};

export const getChat = async (id: number): Promise<ChatResponse> => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/chats/${id}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );
    return await response.json() as ChatResponse;
};

export const createChat = async (request: CreateChatRequest): Promise<ChatResponse> => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/chats`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        },
    );
    return await response.json() as ChatResponse;
};

export const getMessagesFromChat = async (chatId: number): Promise<PageResponse<MessageResponse>> => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/chats/${chatId}/messages`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );
    return await response.json() as PageResponse<MessageResponse>;
};

export const sendMessageToChat = async (chatId: number, request: MessageRequest): Promise<MessageResponse> => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/chats/${chatId}/messages`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        },
    );
    return await response.json() as MessageResponse;
};

export const inviteUserToChat = async (chatId: number, username: string) => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/chats/${chatId}/invite?username=${username}`,
        {
            method: "POST",
        },
    );
    return response;
};

export const getParticipantsFromChat = async (chatId: number): Promise<PageResponse<ParticipantResponse>> => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/chats/${chatId}/participants`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );
    return await response.json() as PageResponse<ParticipantResponse>;
};