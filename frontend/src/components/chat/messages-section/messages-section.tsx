import { useEffect, useRef, useState } from "react";
import MessageInput from "../message-input/message-input";
import MessagesList from "../messages-list/messages-list";
import type { PageResponse } from "../../../types/common/page-response";
import type { MessageResponse } from "../../../types/chat/message-response";
import { Client } from "@stomp/stompjs";
import { chatService } from "../../../services/chat-service";
import { useAuthStore } from "../../../auth/store";

interface MessagesSectionProps {
    chatId: number;
}

export default function MessagesSection({ chatId }: MessagesSectionProps) {
    const token = useAuthStore.getState().accessToken;

    const [messages, setMessages] = useState<PageResponse<MessageResponse>>({
        content: [],
        page: 0,
        limit: 10,
        totalElements: 0,
        totalPages: 0,
    });

    useEffect(() => {
        chatService.getMessagesFromChat(chatId).then((data) => {
            setMessages(data);
        });
    }, [chatId]);

    const stompRef = useRef<Client | null>(null);

    useEffect(() => {
        const stompClient = new Client({
            brokerURL: import.meta.env.VITE_BACKEND_WEBSOCKET_URL,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            onConnect: () => {
                console.log("✅ WebSocket connected");

                stompClient.subscribe(`/topic/chat/${chatId}`, (msg) => {
                    try {
                        const received: MessageResponse = JSON.parse(msg.body);
                        setMessages((prev) => ({
                            ...prev,
                            content: [received, ...prev.content],
                            totalElements: prev.totalElements + 1,
                        }));
                    } catch (e) {
                        console.error("Message parse error:", e);
                    }
                });
            },

            onStompError: (frame) => {
                console.error("❌ STOMP error:", frame.headers["message"]);
            },
        });

        stompClient.activate();
        stompRef.current = stompClient;

        return () => {
            stompClient.deactivate();
        };
    }, [chatId, token]);

    return (
        <>
            <MessagesList messages={messages} />
            <MessageInput chatId={chatId} />
        </>
    );
}
