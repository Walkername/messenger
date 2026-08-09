import { useLayoutEffect, useMemo, useRef, useState } from "react";
import getClaimFromToken from "../../../utils/token-validation";
import {
    formatMessageTimeShort,
    formatTimeLong,
    formatTimeMonthDay,
} from "../../../utils/validation-time";
import type { PageResponse } from "../../../types/common/page-response";
import type { MessageResponse } from "../../../types/chat/message-response";
import "./messages-list.css";
import { useAuthStore } from "../../../auth/store";

interface MessagesListProps {
    messages: PageResponse<MessageResponse>;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoadingMore: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    scrollToBottom: () => void;
}

export default function MessagesList({
    messages,
    onLoadMore,
    hasMore,
    isLoadingMore,
    containerRef,
    scrollToBottom,
}: MessagesListProps) {
    const token = useAuthStore.getState().accessToken!;
    const myAccountId = parseInt(getClaimFromToken(token, "id"));

    // const containerRef = useRef<HTMLDivElement>(null);

    const previousScrollHeight = useRef<number | null>(null);

    const initialLoad = useRef(true);

    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    const handleScroll = () => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        setShowScrollToBottom(distanceFromBottom > 300);

        if (hasMore && !isLoadingMore && container.scrollTop <= 50) {
            previousScrollHeight.current = container.scrollHeight;

            onLoadMore();
        }
    };

    // const scrollToBottom = () => {
    //     const container = containerRef.current;

    //     if (!container) {
    //         return;
    //     }

    //     container.scrollTo({
    //         top: container.scrollHeight,
    //         behavior: "smooth",
    //     });
    // };

    useLayoutEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        if (initialLoad.current && messages.content.length > 0) {
            container.scrollTop = container.scrollHeight;

            initialLoad.current = false;

            return;
        }

        if (previousScrollHeight.current !== null) {
            const heightDifference =
                container.scrollHeight - previousScrollHeight.current;

            container.scrollTop += heightDifference;

            previousScrollHeight.current = null;
        }
    }, [messages.content, containerRef]);

    const groupedMessages = useMemo(() => {
        const groups: {
            date: string;
            messages: MessageResponse[];
        }[] = [];

        messages.content.forEach((msg) => {
            const msgDate = new Date(msg.sentAt);
            const dateKey = msgDate.toDateString();

            const lastGroup = groups[groups.length - 1];

            if (lastGroup && lastGroup.date === dateKey) {
                lastGroup.messages.push(msg);
            } else {
                groups.push({
                    date: dateKey,
                    messages: [msg],
                });
            }
        });

        return groups;
    }, [messages.content]);

    return (
        <div className="messages-wrapper">
            <div
                ref={containerRef}
                className="messages-container"
                onScroll={handleScroll}
            >
                {isLoadingMore && (
                    <div className="messages-loading">Loading...</div>
                )}

                {groupedMessages.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <div className="date-divider">
                            <span className="date-divider-text">
                                {formatTimeMonthDay(group.date)}
                            </span>
                        </div>

                        {group.messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message ${
                                    msg.accountId === myAccountId
                                        ? "own"
                                        : "other"
                                }`}
                            >
                                <div
                                    className="message-owner"
                                    hidden={msg.accountId === myAccountId}
                                >
                                    {msg.username}
                                </div>

                                <div className="message-content">
                                    {msg.content}
                                </div>

                                <div
                                    className="message-time"
                                    data-full-date={formatTimeLong(msg.sentAt)}
                                >
                                    {formatMessageTimeShort(msg.sentAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {showScrollToBottom && (
                <button
                    className="scroll-to-bottom"
                    onClick={scrollToBottom}
                    aria-label="Move to the last messages"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                            {" "}
                            <path
                                d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z"
                                fill="#0F0F0F"
                            ></path>{" "}
                        </g>
                    </svg>
                </button>
            )}
        </div>
    );
}
