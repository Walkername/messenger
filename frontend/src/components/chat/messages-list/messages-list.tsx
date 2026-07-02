import {
    useEffect,
    useRef,
} from "react";
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
}

export default function MessagesList({
    messages,
}: MessagesListProps) {
    const token = useAuthStore.getState().accessToken!;
    const myAccountId = parseInt(getClaimFromToken(token, "id"));

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.content]);

    const groupMessagesByDay = () => {
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
                groups.push({ date: dateKey, messages: [msg] });
            }
        });

        return groups;
    };

    const groupedMessages = groupMessagesByDay();
    
    return (
        <div className="messages-container">
            <div ref={messagesEndRef} />
            {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex}>
                    <div className="date-divider">
                        <span className="date-divider-text">
                            {formatTimeMonthDay(group.date)}
                        </span>
                    </div>

                    {group.messages.toReversed().map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.accountId === myAccountId ? "own" : "other"}`}
                        >
                            <div
                                className="message-owner"
                                hidden={msg.accountId === myAccountId}
                            >
                                {msg.username}
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
                </div>
            ))}
        </div>
    );
}
