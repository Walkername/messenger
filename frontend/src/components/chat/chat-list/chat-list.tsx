import { useEffect, useState } from "react";
import type { PageResponse } from "../../../types/common/page-response";
import type { ChatResponse } from "../../../types/chat/chat-response";
import "./chat-list.css";
import { chatService } from "../../../services/chat-service";
import CreateChatWindow from "../create-chat-window/create-chat-window";
import ExitChatWindow from "../exit-chat-window/exit-chat-window";

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

    const [isExitChatModalOpen, setIsExitChatModalOpen] = useState(false);
    const [chatIdToExit, setChatIdToExit] = useState<number | null>(null);

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
                                    <div
                                        className="chat-exit-button"
                                        onClick={() => {
                                            setChatIdToExit(chat.id);
                                            setIsExitChatModalOpen(true);
                                        }}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g
                                                id="SVGRepo_bgCarrier"
                                                strokeWidth="0"
                                            ></g>
                                            <g
                                                id="SVGRepo_tracerCarrier"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            ></g>
                                            <g id="SVGRepo_iconCarrier">
                                                {" "}
                                                <g id="Interface / Exit">
                                                    {" "}
                                                    <path
                                                        id="Vector"
                                                        d="M12 15L15 12M15 12L12 9M15 12H4M4 7.24802V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2839 4.21799 18.9076C4 18.4798 4 17.9201 4 16.8V16.75"
                                                        stroke="#6c757d"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    ></path>{" "}
                                                </g>{" "}
                                            </g>
                                        </svg>
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
                                    <div className="chat-time">
                                        {formatTime(
                                            chat.lastMessageAt ||
                                                chat.createdAt,
                                        )}
                                    </div>
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
            <ExitChatWindow
                isOpen={isExitChatModalOpen}
                onClose={() => {
                    setIsExitChatModalOpen(false);
                }}
                chatId={chatIdToExit!}
            />
        </div>
    );
}
