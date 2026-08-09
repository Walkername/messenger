import { useCallback, useEffect, useRef, useState } from "react";
import MessageInput from "../message-input/message-input";
import MessagesList from "../messages-list/messages-list";
import type { PageResponse } from "../../../types/common/page-response";
import type { MessageResponse } from "../../../types/chat/message-response";
import { chatService } from "../../../services/chat-service";
import chatWebsocketService from "../../../services/chat-websocket-service";

interface MessagesSectionProps {
    chatId: number;
}

const PAGE_SIZE = 30;

export default function MessagesSection({ chatId }: MessagesSectionProps) {
    const [messages, setMessages] = useState<PageResponse<MessageResponse>>({
        content: [],
        page: 0,
        limit: PAGE_SIZE,
        totalElements: 0,
        totalPages: 0,
    });

    const containerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
        });
    };

    const [hasMore, setHasMore] = useState(true);

    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const loadingMoreRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const data = await chatService.getMessagesFromChat(
                chatId,
                0,
                PAGE_SIZE,
            );

            if (cancelled) {
                return;
            }

            setMessages({
                ...data,
                content: [...data.content].reverse(),
            });

            setHasMore(data.page + 1 < data.totalPages);
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [chatId]);

    const loadMoreMessages = useCallback(async () => {
        if (loadingMoreRef.current || !hasMore) {
            return;
        }

        loadingMoreRef.current = true;
        setIsLoadingMore(true);

        try {
            const nextPage = messages.page + 1;

            const data = await chatService.getMessagesFromChat(
                chatId,
                nextPage,
                PAGE_SIZE,
            );

            const olderMessages = [...data.content].reverse();

            setMessages((prev) => ({
                ...prev,

                content: [...olderMessages, ...prev.content],

                page: data.page,
                totalElements: data.totalElements,
                totalPages: data.totalPages,
            }));

            setHasMore(data.page + 1 < data.totalPages);
        } finally {
            loadingMoreRef.current = false;
            setIsLoadingMore(false);
        }
    }, [chatId, hasMore, messages.page]);

    const handleNewMessage = useCallback((received: MessageResponse) => {
        setMessages((prev) => ({
            ...prev,
            content: [...prev.content, received],
            totalElements: prev.totalElements + 1,
        }));
    }, []);

    useEffect(() => {
        chatWebsocketService.connect(chatId, handleNewMessage);

        return () => {
            chatWebsocketService.unsubscribe();
        };
    }, [chatId, handleNewMessage]);

    return (
        <>
            <MessagesList
                key={chatId}
                messages={messages}
                onLoadMore={loadMoreMessages}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                containerRef={containerRef}
                scrollToBottom={scrollToBottom}
            />

            <MessageInput chatId={chatId} scrollToBottom={scrollToBottom} />
        </>
    );
}
