import { useEffect, useState } from "react";
import type { PageResponse } from "../../../types/common/page-response";
import type { ChatResponse } from "../../../types/chat/chat-response";
import "./chat-list.css";
import { chatService } from "../../../services/chat-service";
import CreateChatWindow from "../create-chat-window/create-chat-window";

interface ChatListProps {
    onSelectChat: (chatId: number) => void;
    selectedChatId: number | null;
}

export default function ChatList({
    onSelectChat,
    selectedChatId,
}: ChatListProps) {
    const [chats, setChats] = useState<PageResponse<ChatResponse> | null>(null);
    const [loading, setLoading] = useState(true);

    const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState(false);

    useEffect(() => {
        chatService
            .getMyChats()
            .then((data) => {
                setChats(data);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleSelectChat = (chatId: number) => {
        onSelectChat(chatId);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Now";
        if (diffMins < 60) return `${diffMins} min`;
        if (diffHours < 24) return `${diffHours} h`;
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} d`;
        return date.toLocaleDateString("en-EN", {
            day: "numeric",
            month: "short",
        });
    };

    const getChatTypeClass = (type: string) => {
        switch (type.toLowerCase()) {
            case "private":
                return "chat-type-private";
            case "group":
                return "chat-type-group";
            case "channel":
                return "chat-type-channel";
            default:
                return "";
        }
    };

    if (loading) {
        return (
            <div className="chat-list-loading">
                <div className="loading-spinner"></div>
                <p>Loading chats...</p>
            </div>
        );
    }

    return (
        <div className="chat-list">
            <div className="chat-list-header">
                <button
                    className="new-chat-btn"
                    onClick={() => setIsCreateChatModalOpen(true)}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create new chat
                </button>
            </div>
            <div className="chat-items">
                {chats?.content.length === 0 ? (
                    <div className="no-chats">
                        <p>You don't have any chats yet</p>
                    </div>
                ) : (
                    chats?.content.map((chat) => (
                        <div
                            key={chat.id}
                            className={`chat-item ${selectedChatId === chat.id ? "active" : ""} ${getChatTypeClass(chat.type)}`}
                            onClick={() => handleSelectChat(chat.id)}
                        >
                            <div className="chat-info">
                                <div className="chat-info-header">
                                    <div className="chat-name">
                                        {chat.name}
                                        {chat.type === "PRIVATE" && (
                                            <span className="group-badge">
                                                PRIVATE
                                            </span>
                                        )}
                                        {chat.type === "GROUP" && (
                                            <span className="channel-badge">
                                                GROUP
                                            </span>
                                        )}
                                    </div>
                                    <div className="chat-time">
                                        {formatTime(
                                            chat.lastMessageAt ||
                                                chat.createdAt,
                                        )}
                                    </div>
                                </div>
                                <div className="chat-last-message">
                                    {chat.lastMessage ? (
                                        <>
                                            <span className="message-preview">
                                                {chat.lastMessage}
                                            </span>
                                            {!chat.lastMessage && (
                                                <span className="no-messages">
                                                    No messages
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="no-messages">
                                            Created{" "}
                                            {new Date(
                                                chat.createdAt,
                                            ).toLocaleDateString("ru-RU")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <CreateChatWindow
                isOpen={isCreateChatModalOpen}
                onClose={() => setIsCreateChatModalOpen(false)}
            />
        </div>
    );
}
