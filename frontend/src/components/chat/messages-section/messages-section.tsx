import { useEffect, useState } from "react";
import MessageInput from "../message-input/message-input";
import MessagesList from "../messages-list/messages-list";
import type { PageResponse } from "../../../types/common/page-response";
import type { MessageResponse } from "../../../types/chat/message-response";
import { chatService } from "../../../services/chat-service";
import chatWebsocketService from "../../../services/chat-websocket-service";

interface MessagesSectionProps {
    chatId: number;
}

export default function MessagesSection({ chatId }: MessagesSectionProps) {
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

    const handleNewMessage = (received: MessageResponse) => {
        setMessages((prev) => ({
            ...prev,
            content: [received, ...prev.content],
            totalElements: prev.totalElements + 1,
        }));
    };

    useEffect(() => {
        chatWebsocketService.connect(chatId, handleNewMessage);

        return () => {
            chatWebsocketService.unsubscribe();
        };
    }, [chatId]);

    return (
        <>
            <MessagesList messages={messages} />
            <MessageInput chatId={chatId} />
        </>
    );
}
