import { useCallback, useEffect, useRef, useState } from "react";
import type { PageResponse } from "../../../types/common/page-response";
import type { ChatResponse } from "../../../types/chat/chat-response";
import "./chat-list.css";
import { chatService } from "../../../services/chat-service";
import CreateChatWindow from "../create-chat-window/create-chat-window";
import ExitChatWindow from "../exit-chat-window/exit-chat-window";
import { LogOut, MessageCirclePlus, Users } from "lucide-react";

interface ChatListProps {
    onSelectChat: (chatId: number) => void;
    selectedChatId: number | null;
}

const PAGE_SIZE = 20;

export default function ChatList({
    onSelectChat,
    selectedChatId,
}: ChatListProps) {
    const [chats, setChats] = useState<PageResponse<ChatResponse>>({
        content: [],
        page: 0,
        limit: PAGE_SIZE,
        totalElements: 0,
        totalPages: 0,
    });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const currentPageRef = useRef(0);
    const loadingMoreRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState(false);

    const [isExitChatModalOpen, setIsExitChatModalOpen] = useState(false);
    const [chatIdToExit, setChatIdToExit] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const data = await chatService.getMyChats(0, PAGE_SIZE);

            if (cancelled) {
                return;
            }

            currentPageRef.current = data.page;

            setChats(data);
            setHasMore(data.page + 1 < data.totalPages);
        };

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    const loadMoreChats = useCallback(async () => {
        if (loadingMoreRef.current || !hasMore) {
            return;
        }

        loadingMoreRef.current = true;
        setIsLoadingMore(true);

        try {
            const nextPage = currentPageRef.current + 1;

            const data = await chatService.getMyChats(nextPage, PAGE_SIZE);

            currentPageRef.current = data.page;

            setChats((prev) => ({
                ...data,
                content: [...prev.content, ...data.content],
            }));

            setHasMore(data.page + 1 < data.totalPages);
        } finally {
            loadingMoreRef.current = false;
            setIsLoadingMore(false);
        }
    }, [hasMore]);

    const handleScroll = useCallback(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const distanceToBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        if (distanceToBottom < 50 && hasMore && !loadingMoreRef.current) {
            loadMoreChats();
        }
    }, [hasMore, loadMoreChats]);

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

    return (
        <div className="chat-list">
            <div className="chat-list-header">
                <button
                    className="new-chat-btn"
                    onClick={() => setIsCreateChatModalOpen(true)}
                >
                    <MessageCirclePlus size={22} color="gray" />
                    Create chat
                </button>
            </div>
            <div
                className="chat-items"
                ref={containerRef}
                onScroll={handleScroll}
            >
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
                                    {chat.type === "GROUP" && (
                                        <div className="chat-name">
                                            <Users size={12} fill="black" />
                                            {chat.name}
                                        </div>
                                    )}
                                    {chat.type === "PRIVATE" && (
                                        <div className="chat-interlocutor-names">
                                            {chat.name.split(":")[0] && (
                                                <span className="chat-interlocutor-name">
                                                    {chat.name.split(":")[0]}
                                                </span>
                                            )}
                                            <span className="chat-interlocutor-username">
                                                @{chat.name.split(":")[1]}
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className="chat-exit-button"
                                        onClick={() => {
                                            setChatIdToExit(chat.id);
                                            setIsExitChatModalOpen(true);
                                        }}
                                    >
                                        <LogOut size={20} color="gray" />
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
