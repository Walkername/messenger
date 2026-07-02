// ChatWindow.tsx
import { useState, useEffect } from "react";
import "./chat-window.css";
import type { ChatResponse } from "../../../types/chat/chat-response";
import ChatHeader from "../chat-header/chat-header";
import MessagesSection from "../messages-section/messages-section";
import { chatService } from "../../../services/chat-service";

interface ChatWindowProps {
    chatId: number;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
    const [chat, setChat] = useState<ChatResponse>();

    useEffect(() => {
        chatService.getChat(chatId).then((data) => {
            setChat(data);
        });
    }, [chatId]);

    return (
        chat &&
        <div className="chat-window">
            <ChatHeader chat={chat} />
            <MessagesSection chatId={chat?.id} />
        </div>
    );
}
