// ChatWindow.tsx
import { useState, useEffect, useRef } from "react";
import {
    getChat,
    getMessagesFromChat,
    sendMessageToChat,
} from "../../../api/chat-api";
import type { PageResponse } from "../../../types/common/page-response";
import type { MessageResponse } from "../../../types/chat/message-response";
import type { MessageRequest } from "../../../types/chat/message-request";
import getClaimFromToken from "../../../utils/token-validation";
import "./chat-window.css";
import type { ChatResponse } from "../../../types/chat/chat-response";

interface ChatWindowProps {
    chatId: number;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
    const token = localStorage.getItem("accessToken")!;
    const myUserId = parseInt(getClaimFromToken(token, "id"));

    const [chat, setChat] = useState<ChatResponse>({
        id: 0,
        name: "",
        type: "",
        lastMessage: "",
        lastMessageAt: "",
        createdAt: "",
    });

    const [messages, setMessages] = useState<PageResponse<MessageResponse>>({
        content: [],
        page: 0,
        limit: 10,
        totalElements: 0,
        totalPages: 0,
    });
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const formatTimeShort = (dateString: string) => {
        const dateObj: Date = new Date(dateString);
        return dateObj.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatMessageTimeShort = (dateString: string) => {
        const dateObj: Date = new Date(dateString);
        return dateObj.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const formatTimeLong = (dateString: string) => {
        const dateObj: Date = new Date(dateString);
        return dateObj.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    useEffect(() => {
        getChat(chatId).then((data) => {
            setChat(data);
        });

        getMessagesFromChat(chatId).then((data) => {
            setMessages(data);
        });
    }, [chatId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message: MessageRequest = {
            content: newMessage,
        };

        sendMessageToChat(chatId, message);

        setNewMessage("");
        getMessagesFromChat(chatId).then((data) => {
            setMessages(data);
        });
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleTextareaChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        const value = e.target.value;

        if (value.length > 300) return;

        setNewMessage(value);

        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    return (
        <div className="chat-window">
            <div className="chat-window-header">
                <h3 className="chat-window-header-name">{chat?.name}</h3>
                <span
                    className="chat-window-header-created-at"
                    data-full-date={formatTimeLong(chat.createdAt)}
                >
                    Created: {formatTimeShort(chat?.createdAt)}
                </span>
            </div>
            <div className="messages-container">
                {messages.content.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message ${msg.accountId === myUserId ? "own" : "other"}`}
                    >
                        <div
                            className="message-owner"
                            hidden={msg.accountId === myUserId ? true : false}
                        >
                            {msg.firstName}
                        </div>
                        <div className="message-content">{msg.content}</div>
                        <div
                            className="message-time"
                            data-full-date={formatTimeLong(msg.sentAt)}
                        >
                            {formatMessageTimeShort(msg.sentAt)}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="message-input-section" onSubmit={sendMessage}>
                <div className="message-input-container">
                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={handleTextareaChange}
                        placeholder="Message"
                        maxLength={300}
                    />
                    <div className="message-input-functions">
                        <svg
                            onClick={sendMessage}
                            className="message-submit-button"
                            fill="#e3e3e3"
                            width="24px"
                            height="24px"
                            viewBox="0 0 512 512"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ transform: "rotate(45deg)" }}
                        >
                            <polygon points="496 16 15.88 208 195 289 448 64 223 317 304 496 496 16" />
                        </svg>
                    </div>
                </div>
            </form>
        </div>
    );
}
